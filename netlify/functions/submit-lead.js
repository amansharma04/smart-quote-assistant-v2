import crypto from 'crypto'
import { validateLeadPayload, scoreLead, fillTemplate } from '../../src/lib/validators.js'
import { getIndustryConfig, getCityConfig } from '../lib/config.js'
import { getLeadsSheet } from '../lib/sheets.js'
import { sendEmail } from '../lib/email.js'
import { generateId, generateReferenceNumber, jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'
import { getClientIp, isRateLimited, isDuplicateSubmission } from '../lib/rateLimit.js'

function escapeHtml(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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

  const industry = getIndustryConfig(input.industryId)
  if (!industry || !industry.enabled) {
    return jsonResponse(400, { error: 'This service category is not currently available.' })
  }

  const city = input.citySlug ? getCityConfig(input.citySlug) : null
  if (input.citySlug && (!city || !city.enabled)) {
    return jsonResponse(400, { error: 'This location is not currently available.' })
  }

  // Honeypot: if this hidden field has any value, silently pretend success.
  if (input.website) {
    return jsonResponse(200, { referenceNumber: generateReferenceNumber(industry.referencePrefix) })
  }

  const { clean, isValid, errors } = validateLeadPayload(industry, input)
  if (!isValid) {
    return jsonResponse(422, { error: 'Please correct the highlighted fields.', fieldErrors: errors })
  }

  const fingerprint = crypto
    .createHash('sha256')
    .update(`${ip}:${industry.id}:${clean.phone || ''}:${clean.zip || ''}`)
    .digest('hex')

  if (isDuplicateSubmission(fingerprint)) {
    return jsonResponse(429, { error: 'This request was already submitted. A professional will be in touch.' })
  }

  const leadId = generateId()
  const referenceNumber = generateReferenceNumber(industry.referencePrefix)
  const score = scoreLead(industry, clean)
  const createdAt = new Date().toISOString()

  try {
    const sheet = await getLeadsSheet()
    await sheet.addRow({
      leadId,
      industryId: industry.id,
      citySlug: input.citySlug || '',
      referenceNumber,
      createdAt,
      status: 'New',
      assignedBusinessId: '',
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
    const notifyTo = process.env.LEAD_NOTIFY_EMAIL
    if (notifyTo) {
      const tpl = industry.emailTemplates?.leadNotification
      const answerRows = Object.entries(clean)
        .filter(([k]) => !['consent', 'website'].includes(k))
        .map(([k, v]) => `<p><strong>${escapeHtml(k)}:</strong> ${escapeHtml(Array.isArray(v) ? v.join(', ') : String(v ?? ''))}</p>`)
        .join('')

      await sendEmail({
        to: notifyTo,
        subject: fillTemplate(tpl?.subject || 'New lead — {referenceNumber}', { referenceNumber }),
        html: `<h2>${escapeHtml(tpl?.heading || 'New lead')} — ${referenceNumber}</h2>${answerRows}`,
      })
    }
  } catch (err) {
    // Email failure should not fail the submission; the lead is already saved.
    console.error('Failed to send lead email:', err.message)
  }

  return jsonResponse(200, { referenceNumber, leadId })
}
