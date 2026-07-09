import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNav from '../../components/AdminNav.jsx'
import { api } from '../../lib/api.js'

export default function AdminAnalytics() {
  const navigate = useNavigate()
  const token = sessionStorage.getItem('admin_token')
  const [leads, setLeads] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
      return
    }
    Promise.all([api.adminLeads(token), api.listClients(token)])
      .then(([leadsData, clientsData]) => {
        setLeads(leadsData.leads || [])
        setClients(clientsData.clients || [])
      })
      .catch((err) => setError(err.message || 'Failed to load analytics.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <AdminNav />
        <main className="max-w-4xl mx-auto px-5 py-8 text-sm text-ink/50">Loading…</main>
      </div>
    )
  }

  const byClient = clients.map((c) => ({
    label: c.businessName,
    count: leads.filter((l) => l.clientSlug === c.slug).length,
  }))

  const bySource = {}
  for (const l of leads) bySource[l.source] = (bySource[l.source] || 0) + 1

  const byStatus = {}
  for (const l of leads) byStatus[l.status] = (byStatus[l.status] || 0) + 1

  const ratedFeedback = leads.filter((l) => l.feedback?.rating)
  const avgRating = ratedFeedback.length
    ? (ratedFeedback.reduce((sum, l) => sum + l.feedback.rating, 0) / ratedFeedback.length).toFixed(1)
    : '—'

  const avgScore = leads.length ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length) : 0

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="max-w-4xl mx-auto px-5 py-8">
        <h1 className="text-xl font-bold mb-6">Analytics</h1>
        {error && <p className="text-signal-red text-sm mb-4">{error}</p>}

        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total leads" value={leads.length} />
          <StatCard label="Avg. lead score" value={avgScore} />
          <StatCard label="Avg. feedback rating" value={avgRating} />
          <StatCard label="Feedback responses" value={ratedFeedback.length} />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white border border-line rounded-card shadow-card p-6">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-ink/60 mb-4">By Client</h2>
            <div className="space-y-2">
              {byClient.map((row) => (
                <BarRow key={row.label} label={row.label} count={row.count} max={leads.length || 1} />
              ))}
            </div>
          </div>

          <div className="bg-white border border-line rounded-card shadow-card p-6">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-ink/60 mb-4">By Source</h2>
            <div className="space-y-2">
              {Object.entries(bySource).map(([source, count]) => (
                <BarRow key={source} label={source} count={count} max={leads.length || 1} />
              ))}
            </div>
          </div>

          <div className="bg-white border border-line rounded-card shadow-card p-6 sm:col-span-2">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-ink/60 mb-4">By Status</h2>
            <div className="space-y-2">
              {Object.entries(byStatus).map(([status, count]) => (
                <BarRow key={status} label={status} count={count} max={leads.length || 1} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-line rounded-card shadow-card p-5">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono">{value}</p>
    </div>
  )
}

function BarRow({ label, count, max }) {
  const pct = Math.round((count / max) * 100)
  return (
    <div>
      <div className="flex justify-between text-xs text-ink/60 mb-1">
        <span>{label}</span>
        <span className="font-mono">{count}</span>
      </div>
      <div className="h-1.5 bg-line rounded-full overflow-hidden">
        <div className="h-full bg-signal-teal" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
