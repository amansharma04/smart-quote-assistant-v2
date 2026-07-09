import { verifyAdminToken } from '../lib/auth.js'
import { getLeadsSheet } from '../lib/sheets.js'
import { sanitizeText, LEAD_STATUSES } from '../../src/lib/validators.js'
import { jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'

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
  if (!leadId || typeof leadId !== 'string') {
    return jsonResponse(400, { error: 'leadId is required.' })
  }

  if (input.status && !LEAD_STATUSES.includes(input.status)) {
    return jsonResponse(400, { error: 'Invalid status.' })
  }

  try {
    const sheet = await getLeadsSheet()
    const rows = await sheet.getRows()
    const row = rows.find((r) => r.get('leadId') === leadId)
    if (!row) return jsonResponse(404, { error: 'Lead not found.' })

    if (input.status) row.set('status', input.status)
    if (typeof input.internalNotes === 'string') {
      row.set('internalNotes', sanitizeText(input.internalNotes, 2000))
    }

    await row.save()
    return jsonResponse(200, { ok: true })
  } catch (err) {
    console.error('Failed to update lead:', err.message)
    return safeErrorResponse(502)
  }
}
