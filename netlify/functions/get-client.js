import { getIndustryTemplate, getStaticClient } from '../lib/config.js'
import { getClientsSheet, rowToClient } from '../lib/sheets.js'
import { resolveClientPage } from '../../src/lib/clientTemplate.js'
import { jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, {})
  if (event.httpMethod !== 'GET') return methodNotAllowed()

  const { slug } = event.queryStringParameters || {}
  if (!slug) return jsonResponse(400, { error: 'slug is required.' })

  try {
    let client = getStaticClient(slug)

    if (!client) {
      const sheet = await getClientsSheet()
      const rows = await sheet.getRows()
      const row = rows.find((r) => r.get('slug') === slug)
      client = row ? rowToClient(row) : null
    }

    if (!client || !client.enabled) {
      return jsonResponse(404, { error: 'This page is not available.' })
    }

    const template = getIndustryTemplate(client.industryTemplateId)
    if (!template) return safeErrorResponse(500)

    return jsonResponse(200, { client: resolveClientPage(client, template) })
  } catch (err) {
    console.error('Failed to load client:', err.message)
    return safeErrorResponse(502)
  }
}
