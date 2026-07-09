import { getSettingsSheet } from '../lib/sheets.js'
import { jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, {})
  if (event.httpMethod !== 'GET') return methodNotAllowed()

  try {
    const sheet = await getSettingsSheet()
    const rows = await sheet.getRows()
    const row = rows.find((r) => r.get('key') === 'overrides')
    const overrides = row ? JSON.parse(row.get('valueJson') || '{}') : {}
    return jsonResponse(200, { overrides })
  } catch (err) {
    console.error('Failed to load site config:', err.message)
    // Fail open with empty overrides so the public site still renders from
    // the static JSON configs even if Sheets is briefly unavailable.
    return jsonResponse(200, { overrides: {} })
  }
}
