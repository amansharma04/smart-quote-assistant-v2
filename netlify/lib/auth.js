import crypto from 'crypto'

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8 // 8 hours

function getSecret() {
  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error('Admin auth is not configured.')
  // Derive a signing secret from the admin password so no extra env var is required.
  return crypto.createHash('sha256').update(`admin-token-secret:${password}`).digest()
}

export function createAdminToken() {
  const payload = { exp: Date.now() + TOKEN_TTL_MS }
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url')
  return `${payloadB64}.${sig}`
}

export function verifyAdminToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  const token = authHeader.slice('Bearer '.length).trim()
  const [payloadB64, sig] = token.split('.')
  if (!payloadB64 || !sig) return false

  let expectedSig
  try {
    expectedSig = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url')
  } catch {
    return false
  }

  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expectedSig)
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
    if (!payload.exp || Date.now() > payload.exp) return false
    return true
  } catch {
    return false
  }
}

export function timingSafeEqualString(a, b) {
  const aBuf = Buffer.from(String(a))
  const bBuf = Buffer.from(String(b))
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}
