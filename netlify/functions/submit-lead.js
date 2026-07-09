import crypto from 'crypto'
import { validateLeadPayload, scoreLead, fillTemplate } from '../../src/lib/validators.js'
import { resolveClientPage } from '../../src/lib/clientTemplate.js'
import { getIndustryTemplate, getStaticClient } from '../lib/config.js'
import { getClientsSheet, getLeadsSheet, rowToClient } from '../lib/sheets.js'
import { sendEmail } from '../lib/email.js'
import { generateId, generateReferenceNumber, jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'
import { getClientIp, isRateLimited, isDuplicateSubmission } from '../lib/rateLimit.js'

const VALID_SOURCES = ['website', 'instagram', 'facebook', 'google-business', 'qr', 'email', 'sms', 'direct']

function escapeHtml(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function loadClient(slug) {
  const staticClient = getStaticClient(slug)
  if (staticClient) return staticClient

  const sheet = await getClientsSheet()
  const rows = await sheet.getRows()
  const row = rows.find((r) => r.get('slug') === slug)
  return row ? rowToClient(row) : null
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, {})
  if (event.httpMethod !== 'POST') return methodNotAllowed()

  const ip = getClientIp(event)
  if (isRateLimited(ip)) {
    return jsonResponse(429, { error: 'Too many requests. Please wait a moment and try again.' })
  }

  let input
  try {
    input = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Invalid request.' })
  }

  let client
  try {
    client = await loadClient(input.clientSlug)
  } catch (err) {
    console.error('Failed to load client:', err.message)
    return safeErrorResponse(502)
  }

  if (!client || !client.enabled) {
    return jsonResponse(400, { error: 'This page is not currently available.' })
  }

  const template = getIndustryTemplate(client.industryTemplateId)
  if (!template) return safeErrorResponse(500)

  const resolved = resolveClientPage(client, template)

  // Honeypot: if this hidden field has any value, silently pretend success.
  if (input.website) {
    return jsonResponse(200, { referenceNumber: generateReferenceNumber(resolved.referencePrefix) })
  }

  const { clean, isValid, errors } = validateLeadPayload(resolved, input)
  if (!isValid) {
    return jsonResponse(422, { error: 'Please correct the highlighted fields.', fieldErrors: errors })
  }

  const source = VALID_SOURCES.includes(input.source) ? input.source : 'website'

  const fingerprint = crypto
    .createHash('sha256')
    .update(`${ip}:${client.clientId}:${clean.phone || ''}:${clean.zip || ''}`)
    .digest('hex')

  if (isDuplicateSubmission(fingerprint)) {
    return jsonResponse(429, { error: 'This request was already submitted. We will be in touch.' })
  }

  const leadId = generateId()
  const referenceNumber = generateReferenceNumber(resolved.referencePrefix)
  const score = scoreLead(resolved, clean)
  const createdAt = new Date().toISOString()

  try {
    const sheet = await getLeadsSheet()
    await sheet.addRow({
      leadId,
      clientId: client.clientId || '',
      clientSlug: client.slug,
      industryTemplateId: template.id,
      referenceNumber,
      createdAt,
      status: 'New',
      source,
      internalNotes: '',
      score: String(score),
      answersJson: JSON.stringify(clean),
      feedbackToken: '',
      feedbackTokenExpiresAt: '',
      feedbackJson: '',
      submitterIp: ip,
    })
  } catch (err) {
    console.error('Failed to save lead:', err.message)
    return safeErrorResponse(502)
  }

  try {
    const recipients = [client.notificationEmail, client.secondaryNotifyEmail].filter(Boolean)
    if (recipients.length) {
      const tpl = resolved.emailTemplates?.leadNotification
      const answerRows = Object.entries(clean)
        .filter(([k]) => !['consent', 'website'].includes(k))
        .map(([k, v]) => `<p><strong>${escapeHtml(k)}:</strong> ${escapeHtml(Array.isArray(v) ? v.join(', ') : String(v ?? ''))}</p>`)
        .join('')

      await sendEmail({
        to: recipients.join(','),
        subject: fillTemplate(tpl?.subject || 'New quote request — {referenceNumber}', { referenceNumber }),
        html: `<h2>${escapeHtml(tpl?.heading || 'New quote request')} — ${referenceNumber}</h2><p><strong>Source:</strong> ${escapeHtml(source)}</p>${answerRows}`,
      })
    }
  } catch (err) {
    // Email failure should not fail the submission; the lead is already saved.
    console.error('Failed to send lead email:', err.message)
  }

  return jsonResponse(200, { referenceNumber, leadId })
}
