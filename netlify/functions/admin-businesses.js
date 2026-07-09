import { verifyAdminToken } from '../lib/auth.js'
import { getBusinessesSheet, rowToBusiness } from '../lib/sheets.js'
import { sanitizeText, BUSINESS_STATUSES } from '../../src/lib/validators.js'
import { generateId, jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, {})

  if (!verifyAdminToken(event.headers.authorization)) {
    return jsonResponse(401, { error: 'Unauthorized.' })
  }

  try {
    const sheet = await getBusinessesSheet()

    if (event.httpMethod === 'GET') {
      const rows = await sheet.getRows()
      let businesses = rows.map(rowToBusiness)
      const { industryId } = event.queryStringParameters || {}
      if (industryId) businesses = businesses.filter((b) => b.industryId === industryId)
      return jsonResponse(200, { businesses })
    }

    if (event.httpMethod === 'POST') {
      let input
      try {
        input = JSON.parse(event.body || '{}')
      } catch {
        return jsonResponse(400, { error: 'Invalid request.' })
      }

      if (input.status && !BUSINESS_STATUSES.includes(input.status)) {
        return jsonResponse(400, { error: 'Invalid status.' })
      }

      const fields = {
        industryId: sanitizeText(input.industryId, 60),
        companyName: sanitizeText(input.companyName, 150),
        ownerName: sanitizeText(input.ownerName, 150),
        phone: sanitizeText(input.phone, 30),
        email: sanitizeText(input.email, 150),
        website: sanitizeText(input.website, 200),
        serviceArea: sanitizeText(input.serviceArea, 200),
        cities: JSON.stringify(Array.isArray(input.cities) ? input.cities : []),
        status: input.status || 'Prospect',
        pricing: sanitizeText(input.pricing, 100),
        notes: sanitizeText(input.notes, 2000),
      }

      if (!fields.companyName) return jsonResponse(400, { error: 'Company name is required.' })

      if (input.businessId) {
        const rows = await sheet.getRows()
        const row = rows.find((r) => r.get('businessId') === input.businessId)
        if (!row) return jsonResponse(404, { error: 'Business not found.' })
        Object.entries(fields).forEach(([k, v]) => row.set(k, v))
        await row.save()
        return jsonResponse(200, { ok: true })
      }

      await sheet.addRow({
        businessId: generateId(),
        createdAt: new Date().toISOString(),
        ...fields,
      })
      return jsonResponse(200, { ok: true })
    }

    return methodNotAllowed()
  } catch (err) {
    console.error('Failed in admin-businesses:', err.message)
    return safeErrorResponse(502)
  }
}
