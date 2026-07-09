import { verifyAdminToken } from '../lib/auth.js'
import { getLeadsSheet, rowToLead } from '../lib/sheets.js'
import { jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'

function csvEscape(value) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, {})
  if (event.httpMethod !== 'GET') return methodNotAllowed()

  if (!verifyAdminToken(event.headers.authorization)) {
    return jsonResponse(401, { error: 'Unauthorized.' })
  }

  try {
    const sheet = await getLeadsSheet()
    const rows = await sheet.getRows()
    const leads = rows.map(rowToLead)

    const columns = [
      'leadId',
      'industryId',
      'citySlug',
      'referenceNumber',
      'createdAt',
      'status',
      'assignedBusinessId',
      'score',
      'internalNotes',
    ]

    const lines = [columns.join(',')]
    for (const lead of leads) {
      lines.push(columns.map((c) => csvEscape(lead[c])).join(','))
    }

    return jsonResponse(200, { csv: lines.join('\n') })
  } catch (err) {
    console.error('Failed to export leads:', err.message)
    return safeErrorResponse(502)
  }
}
