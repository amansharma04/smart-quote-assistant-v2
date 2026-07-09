import { verifyAdminToken } from '../lib/auth.js'
import { getLeadsSheet } from '../lib/sheets.js'
import { generateSecureToken, jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 14 // 14 days

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, {})
  if (event.httpMethod !== 'POST') return methodNotAllowed()

  if (!verifyAdminToken(event.headers.authorization)) {
    return jsonResponse(401, { error: 'Unauthorized.' })
  }

  let input
  try {
    input = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Invalid request.' })
  }

  const { leadId } = input
  if (!leadId) return jsonResponse(400, { error: 'leadId is required.' })

  try {
    const sheet = await getLeadsSheet()
    const rows = await sheet.getRows()
    const row = rows.find((r) => r.get('leadId') === leadId)
    if (!row) return jsonResponse(404, { error: 'Lead not found.' })

    const token = generateSecureToken()
    row.set('feedbackToken', token)
    row.set('feedbackTokenExpiresAt', String(Date.now() + TOKEN_TTL_MS))
    await row.save()

    return jsonResponse(200, { token })
  } catch (err) {
    console.error('Failed to create feedback token:', err.message)
    return safeErrorResponse(502)
  }
}
