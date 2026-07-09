import { createAdminToken, timingSafeEqualString } from '../lib/auth.js'
import { jsonResponse, safeErrorResponse, methodNotAllowed } from '../lib/util.js'
import { getClientIp, isRateLimited } from '../lib/rateLimit.js'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, {})
  if (event.httpMethod !== 'POST') return methodNotAllowed()

  const ip = getClientIp(event)
  if (isRateLimited(ip)) {
    return jsonResponse(429, { error: 'Too many attempts. Please wait a moment and try again.' })
  }

  let input
  try {
    input = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, { error: 'Invalid request.' })
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD is not set.')
    return safeErrorResponse(500)
  }

  const submitted = typeof input.password === 'string' ? input.password : ''
  if (!submitted || !timingSafeEqualString(submitted, adminPassword)) {
    return jsonResponse(401, { error: 'Incorrect password.' })
  }

  const token = createAdminToken()
  return jsonResponse(200, { token })
}
