export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.FROM_EMAIL

  if (!apiKey || !from) {
    // Do not throw: a missing email config should not block lead capture,
    // since the lead is already safely stored in Google Sheets.
    console.warn('Email not configured; skipping send.')
    return { skipped: true }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!res.ok) {
    console.warn('Email send failed with status', res.status)
    return { skipped: true }
  }

  return { skipped: false }
}
