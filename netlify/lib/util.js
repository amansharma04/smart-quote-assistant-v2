import crypto from 'crypto'

export function generateId() {
  return crypto.randomBytes(12).toString('hex')
}

export function generateReferenceNumber(prefix = 'REQ') {
  const rand = crypto.randomInt(100000, 999999)
  return `${prefix}-${rand}`
}

export function generateSecureToken() {
  return crypto.randomBytes(24).toString('base64url')
}

export function corsHeaders() {
  const origin = process.env.ALLOWED_ORIGIN || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }
}

export function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(body),
  }
}

// Generic, non-revealing error message for anything unexpected.
export function safeErrorResponse(statusCode = 500) {
  return jsonResponse(statusCode, { error: 'Something went wrong. Please try again.' })
}

export function methodNotAllowed() {
  return jsonResponse(405, { error: 'Method not allowed.' })
}
