import { verifyAdminToken } from '../lib/auth.js'
import { getClientsSheet, rowToClient } from '../lib/sheets.js'
import { sanitizeText } from '../../src/lib/validators.js'
import { generateId, jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'

const SLUG_RE = /^[a-z0-9-]+$/

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, {})

  if (!verifyAdminToken(event.headers.authorization)) {
    return jsonResponse(401, { error: 'Unauthorized.' })
  }

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return methodNotAllowed()
  }

  let fields = null
  let clientId = null

  if (event.httpMethod === 'POST') {
    let input
    try {
      input = JSON.parse(event.body || '{}')
    } catch {
      return jsonResponse(400, { error: 'Invalid request.' })
    }

    const slug = sanitizeText(input.slug, 60).toLowerCase().replace(/\s+/g, '-')
    if (!slug || !SLUG_RE.test(slug)) {
      return jsonResponse(400, { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' })
    }

    fields = {
      slug,
      businessName: sanitizeText(input.businessName, 150),
      logo: sanitizeText(input.logo, 500),
      brandColor: /^#[0-9a-fA-F]{6}$/.test(input.brandColor || '') ? input.brandColor : '#0E7C86',
      industryTemplateId: sanitizeText(input.industryTemplateId, 60),
      servicesJson: JSON.stringify(Array.isArray(input.services) ? input.services.map((s) => sanitizeText(s, 100)) : []),
      extraQuestionsJson: JSON.stringify(Array.isArray(input.extraQuestions) ? input.extraQuestions : []),
      notificationEmail: sanitizeText(input.notificationEmail, 150),
      secondaryNotifyEmail: sanitizeText(input.secondaryNotifyEmail, 150),
      phone: sanitizeText(input.phone, 30),
      website: sanitizeText(input.website, 200),
      serviceArea: sanitizeText(input.serviceArea, 200),
      headline: sanitizeText(input.headline, 200),
      subheadline: sanitizeText(input.subheadline, 400),
      submitButtonText: sanitizeText(input.submitButtonText, 60),
      enabled: input.enabled === false ? 'false' : 'true',
    }

    if (!fields.businessName) return jsonResponse(400, { error: 'Business name is required.' })
    if (!fields.industryTemplateId) return jsonResponse(400, { error: 'Industry template is required.' })
    if (!fields.notificationEmail) return jsonResponse(400, { error: 'Notification email is required.' })

    clientId = input.clientId || null
  }

  try {
    const sheet = await getClientsSheet()

    if (event.httpMethod === 'GET') {
      const rows = await sheet.getRows()
      return jsonResponse(200, { clients: rows.map(rowToClient) })
    }

    const rows = await sheet.getRows()

    if (clientId) {
      const row = rows.find((r) => r.get('clientId') === clientId)
      if (!row) return jsonResponse(404, { error: 'Client not found.' })

      const slugTaken = rows.some((r) => r.get('clientId') !== clientId && r.get('slug') === fields.slug)
      if (slugTaken) return jsonResponse(400, { error: 'That slug is already in use by another client.' })

      Object.entries(fields).forEach(([k, v]) => row.set(k, v))
      await row.save()
      return jsonResponse(200, { ok: true, clientId })
    }

    const slugTaken = rows.some((r) => r.get('slug') === fields.slug)
    if (slugTaken) return jsonResponse(400, { error: 'That slug is already in use.' })

    const newClientId = generateId()
    await sheet.addRow({ clientId: newClientId, createdAt: new Date().toISOString(), ...fields })
    return jsonResponse(200, { ok: true, clientId: newClientId })
  } catch (err) {
    console.error('Failed in admin-clients:', err.message)
    return safeErrorResponse(502)
  }
}
