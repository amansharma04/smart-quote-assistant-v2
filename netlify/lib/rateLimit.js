// Best-effort, in-memory rate limiting. Netlify Functions may run on separate
// container instances, so this does not guarantee a global limit across all
// invocations — it protects against bursts hitting a single warm instance.
// For strict cross-instance limiting, back this with a persistent store.

const WINDOW_MS = 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 8
const DUPLICATE_WINDOW_MS = 60 * 1000

const requestLog = new Map() // ip -> [timestamps]
const submissionFingerprints = new Map() // fingerprint -> timestamp

export function getClientIp(event) {
  const forwarded = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for']
  if (!forwarded) return 'unknown'
  return forwarded.split(',')[0].trim()
}

export function isRateLimited(ip) {
  const now = Date.now()
  const entries = (requestLog.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  entries.push(now)
  requestLog.set(ip, entries)
  return entries.length > MAX_REQUESTS_PER_WINDOW
}

export function isDuplicateSubmission(fingerprint) {
  const now = Date.now()
  const last = submissionFingerprints.get(fingerprint)
  submissionFingerprints.set(fingerprint, now)

  // Periodic cleanup to avoid unbounded growth in a warm instance.
  if (submissionFingerprints.size > 5000) {
    for (const [key, ts] of submissionFingerprints) {
      if (now - ts > DUPLICATE_WINDOW_MS) submissionFingerprints.delete(key)
    }
  }

  return Boolean(last && now - last < DUPLICATE_WINDOW_MS)
}
