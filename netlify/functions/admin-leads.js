import { verifyAdminToken } from '../lib/auth.js'
import { getLeadsSheet, rowToLead } from '../lib/sheets.js'
import { jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, {})
  if (event.httpMethod !== 'GET') return methodNotAllowed()

  if (!verifyAdminToken(event.headers.authorization)) {
    return jsonResponse(401, { error: 'Unauthorized.' })
  }

  const params = event.queryStringParameters || {}

  try {
    const sheet = await getLeadsSheet()
    const rows = await sheet.getRows()
    let leads = rows.map(rowToLead)

    if (params.leadId) {
      const lead = leads.find((l) => l.leadId === params.leadId)
      if (!lead) return jsonResponse(404, { error: 'Lead not found.' })
      return jsonResponse(200, { lead })
    }

    if (params.status) leads = leads.filter((l) => l.status === params.status)
    if (params.clientId) leads = leads.filter((l) => l.clientId === params.clientId)

    leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return jsonResponse(200, { leads })
  } catch (err) {
    console.error('Failed to load leads:', err.message)
    return safeErrorResponse(502)
  }
}
