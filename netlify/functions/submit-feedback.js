import { validateFeedbackPayload } from '../../src/lib/validators.js'
import { getIndustryTemplate } from '../lib/config.js'
import { getLeadsSheet } from '../lib/sheets.js'
import { jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'
import { getClientIp, isRateLimited } from '../lib/rateLimit.js'

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

  const { leadId, token } = input
  if (!leadId || !token) return jsonResponse(400, { error: 'Invalid feedback link.' })

  try {
    const sheet = await getLeadsSheet()
    const rows = await sheet.getRows()
    const row = rows.find((r) => r.get('leadId') === leadId)

    const validToken = row && row.get('feedbackToken') === token
    const expiresAt = row ? Number(row.get('feedbackTokenExpiresAt') || 0) : 0
    const notExpired = expiresAt && Date.now() < expiresAt

    if (!validToken || !notExpired) {
      return jsonResponse(404, { error: 'This feedback link is invalid or has expired.' })
    }

    const template = getIndustryTemplate(row.get('industryTemplateId'))
    if (!template) return safeErrorResponse(500)

    const { clean, isValid, errors } = validateFeedbackPayload(template, input)
    if (!isValid) {
      return jsonResponse(422, { error: 'Please correct the highlighted fields.', fieldErrors: errors })
    }

    row.set('feedbackJson', JSON.stringify(clean))
    row.set('status', 'Feedback Received')
    await row.save()

    return jsonResponse(200, { ok: true })
  } catch (err) {
    console.error('Failed to submit feedback:', err.message)
    return safeErrorResponse(502)
  }
}
