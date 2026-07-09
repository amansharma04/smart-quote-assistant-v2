import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import QRCode from 'qrcode'
import AdminNav from '../../components/AdminNav.jsx'
import { api } from '../../lib/api.js'

const SOURCES = [
  { key: 'website', label: 'Website' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'google-business', label: 'Google Business Profile' },
  { key: 'qr', label: 'QR Code' },
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
]

export default function AdminClientLinks() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const token = sessionStorage.getItem('admin_token')

  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copyMsg, setCopyMsg] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
      return
    }
    api
      .listClients(token)
      .then((data) => {
        const found = (data.clients || []).find((c) => c.clientId === clientId)
        setClient(found || null)
      })
      .catch((err) => setError(err.message || 'Failed to load client.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  useEffect(() => {
    if (!client) return
    const qrUrl = `${window.location.origin}/${client.slug}?source=qr`
    QRCode.toDataURL(qrUrl, { width: 320, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''))
  }, [client])

  function copy(text, label) {
    navigator.clipboard.writeText(text)
    setCopyMsg(label)
    setTimeout(() => setCopyMsg(''), 2000)
  }

  if (loading) return <div className="p-8 text-ink/50 text-sm">Loading…</div>
  if (!client) return <div className="p-8 text-signal-red text-sm">{error || 'Client not found.'}</div>

  const baseUrl = `${window.location.origin}/${client.slug}`
  const embedSnippet = `<iframe src="${baseUrl}?source=website" style="width:100%;max-width:640px;height:900px;border:0;" title="Request a quote from ${client.businessName}"></iframe>`

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="max-w-2xl mx-auto px-5 py-8 space-y-6">
        <Link to="/admin/clients" className="text-sm text-signal-teal hover:underline">
          ← Back to clients
        </Link>

        <div>
          <h1 className="text-2xl font-bold">{client.businessName}</h1>
          <p className="text-sm text-ink/50">Sharing links &amp; QR code</p>
        </div>

        {copyMsg && <p className="text-signal-green text-sm">{copyMsg} copied to clipboard.</p>}

        <section className="bg-white border border-line rounded-card shadow-card p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-ink/60 mb-4">Source-tracked links</h2>
          <p className="text-xs text-ink/50 mb-4">
            Use a different link for each place you post — every submission records where it came from.
          </p>
          <div className="space-y-2">
            {SOURCES.map((s) => {
              const url = `${baseUrl}?source=${s.key}`
              return (
                <div key={s.key} className="flex items-center justify-between gap-3 border border-line rounded-card px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs text-ink/50">{s.label}</p>
                    <p className="text-sm font-mono truncate">{url}</p>
                  </div>
                  <button
                    onClick={() => copy(url, s.label)}
                    className="text-xs text-signal-teal hover:underline shrink-0"
                  >
                    Copy
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-white border border-line rounded-card shadow-card p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-ink/60 mb-4">QR code</h2>
          <p className="text-xs text-ink/50 mb-4">
            Print this on a truck, yard sign, or business card. Scans are tracked as source "qr."
          </p>
          {qrDataUrl && (
            <div className="flex flex-col items-start gap-3">
              <img src={qrDataUrl} alt="QR code" className="w-40 h-40 border border-line rounded-card" />
              <a
                href={qrDataUrl}
                download={`${client.slug}-qr-code.png`}
                className="text-sm text-signal-teal hover:underline"
              >
                Download QR code
              </a>
            </div>
          )}
        </section>

        <section className="bg-white border border-line rounded-card shadow-card p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-ink/60 mb-4">Embeddable widget</h2>
          <p className="text-xs text-ink/50 mb-4">Paste this into any page on your own website.</p>
          <pre className="bg-paper border border-line rounded-card p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
            {embedSnippet}
          </pre>
          <button onClick={() => copy(embedSnippet, 'Embed code')} className="mt-3 text-sm text-signal-teal hover:underline">
            Copy embed code
          </button>
        </section>
      </main>
    </div>
  )
}
