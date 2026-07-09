import { getLeadsSheet } from '../lib/sheets.js'
import { jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'
import { getClientIp, isRateLimited } from '../lib/rateLimit.js'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, {})
  if (event.httpMethod !== 'GET') return methodNotAllowed()

  const ip = getClientIp(event)
  if (isRateLimited(ip)) {
    return jsonResponse(429, { error: 'Too many requests. Please wait a moment and try again.' })
  }

  const { leadId, token } = event.queryStringParameters || {}
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

    // Deliberately minimal: only what's needed to render the right question
    // set. Full lead details are never exposed on this endpoint.
    return jsonResponse(200, {
      industryTemplateId: row.get('industryTemplateId'),
      referenceNumber: row.get('referenceNumber'),
      alreadySubmitted: Boolean(row.get('feedbackJson')),
    })
  } catch (err) {
    console.error('Failed to load feedback context:', err.message)
    return safeErrorResponse(502)
  }
}
