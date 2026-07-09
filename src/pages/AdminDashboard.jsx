import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNav from '../components/AdminNav.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { LEAD_STATUSES } from '../lib/validators.js'
import { listIndustries } from '../config/industries/index.js'
import { api } from '../lib/api.js'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const token = sessionStorage.getItem('admin_token')

  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')

  const industries = listIndustries()

  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
      return
    }
    loadLeads()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, industryFilter])

  async function loadLeads() {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams()
      if (statusFilter) qs.set('status', statusFilter)
      if (industryFilter) qs.set('industryId', industryFilter)
      const query = qs.toString() ? `?${qs.toString()}` : ''
      const data = await api.adminLeads(token, query)
      setLeads(data.leads || [])
    } catch (err) {
      if (err.message?.toLowerCase().includes('unauthorized')) {
        sessionStorage.removeItem('admin_token')
        navigate('/admin/login')
        return
      }
      setError(err.message || 'Failed to load leads.')
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    try {
      const data = await api.exportLeads(token)
      const blob = new Blob([data.csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message || 'Export failed.')
    }
  }

  function industryLabel(id) {
    return industries.find((i) => i.id === id)?.displayName || id
  }

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />

      <main className="max-w-5xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-semibold text-lg">Leads</h1>
          <button onClick={handleExport} className="text-sm text-signal-teal hover:underline">
            Export CSV
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <FilterChip label="All industries" active={industryFilter === ''} onClick={() => setIndustryFilter('')} />
          {industries.map((i) => (
            <FilterChip
              key={i.id}
              label={i.displayName}
              active={industryFilter === i.id}
              onClick={() => setIndustryFilter(i.id)}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterChip label="All statuses" active={statusFilter === ''} onClick={() => setStatusFilter('')} />
          {LEAD_STATUSES.map((s) => (
            <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
          ))}
        </div>

        {error && <p className="text-signal-red text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-ink/50 text-sm">Loading leads…</p>
        ) : leads.length === 0 ? (
          <p className="text-ink/50 text-sm">No leads match this filter.</p>
        ) : (
          <div className="bg-white border border-line rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper text-ink/50 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Ref #</th>
                  <th className="text-left px-4 py-3">Industry</th>
                  <th className="text-left px-4 py-3">City</th>
                  <th className="text-left px-4 py-3">Score</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Received</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.leadId}
                    onClick={() => navigate(`/admin/leads/${lead.leadId}`)}
                    className="border-t border-line hover:bg-paper cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{lead.referenceNumber}</td>
                    <td className="px-4 py-3">{industryLabel(lead.industryId)}</td>
                    <td className="px-4 py-3">{lead.citySlug || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{lead.score}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-ink/50 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors ${
        active ? 'border-signal-teal bg-signal-teal/10 text-signal-tealDark' : 'border-line text-ink/60 hover:border-signal-teal/50'
      }`}
    >
      {label}
    </button>
  )
}
