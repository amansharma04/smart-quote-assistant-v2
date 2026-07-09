import { verifyAdminToken } from '../lib/auth.js'
import { getSettingsSheet } from '../lib/sheets.js'
import { jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, {})

  if (!verifyAdminToken(event.headers.authorization)) {
    return jsonResponse(401, { error: 'Unauthorized.' })
  }

  try {
    const sheet = await getSettingsSheet()
    const rows = await sheet.getRows()
    let row = rows.find((r) => r.get('key') === 'overrides')

    if (event.httpMethod === 'GET') {
      const overrides = row ? JSON.parse(row.get('valueJson') || '{}') : {}
      return jsonResponse(200, { overrides })
    }

    if (event.httpMethod === 'POST') {
      let input
      try {
        input = JSON.parse(event.body || '{}')
      } catch {
        return jsonResponse(400, { error: 'Invalid request.' })
      }

      const overrides = input.overrides
      if (typeof overrides !== 'object' || overrides === null) {
        return jsonResponse(400, { error: 'overrides object is required.' })
      }

      const valueJson = JSON.stringify(overrides)
      if (row) {
        row.set('valueJson', valueJson)
        row.set('updatedAt', new Date().toISOString())
        await row.save()
      } else {
        await sheet.addRow({ key: 'overrides', valueJson, updatedAt: new Date().toISOString() })
      }

      return jsonResponse(200, { ok: true })
    }

    return methodNotAllowed()
  } catch (err) {
    console.error('Failed in admin-site-config:', err.message)
    return safeErrorResponse(502)
  }
}
