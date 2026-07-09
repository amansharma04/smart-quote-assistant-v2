import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AdminNav from '../../components/AdminNav.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { LEAD_STATUSES, fillTemplate } from '../../lib/validators.js'
import { getIndustry } from '../../config/industries/index.js'
import { api } from '../../lib/api.js'

export default function AdminLeadDetail() {
  const { leadId } = useParams()
  const navigate = useNavigate()
  const token = sessionStorage.getItem('admin_token')

  const [lead, setLead] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copyMsg, setCopyMsg] = useState('')
  const [feedbackLink, setFeedbackLink] = useState('')

  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
      return
    }
    loadLead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadLead() {
    setLoading(true)
    setError('')
    try {
      const data = await api.adminLeads(token, `?leadId=${encodeURIComponent(leadId)}`)
      setLead(data.lead)
      setNotes(data.lead?.internalNotes || '')
      if (data.lead?.feedbackToken) {
        setFeedbackLink(`${window.location.origin}/feedback/${data.lead.leadId}/${data.lead.feedbackToken}`)
      }
    } catch (err) {
      setError(err.message || 'Failed to load lead.')
    } finally {
      setLoading(false)
    }
  }

  async function saveUpdate(fields) {
    setError('')
    try {
      await api.updateLead(token, { leadId, ...fields })
      await loadLead()
    } catch (err) {
      setError(err.message || 'Update failed.')
    }
  }

  async function handleGenerateFeedbackLink() {
    try {
      const data = await api.createFeedbackToken(token, leadId)
      setFeedbackLink(`${window.location.origin}/feedback/${leadId}/${data.token}`)
      await saveUpdate({ status: 'Feedback Requested' })
    } catch (err) {
      setError(err.message || 'Could not generate feedback link.')
    }
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text)
    setCopyMsg(label)
    setTimeout(() => setCopyMsg(''), 2000)
  }

  if (loading) return <div className="p-8 text-ink/50 text-sm">Loading…</div>
  if (!lead) return <div className="p-8 text-signal-red text-sm">{error || 'Lead not found.'}</div>

  const template = getIndustry(lead.industryTemplateId)
  const questionLabels = Object.fromEntries((template?.questions || []).map((q) => [q.id, q.label]))

  const answerLines = Object.entries(lead.answers)
    .filter(([k]) => !['consent', 'website'].includes(k))
    .map(([k, v]) => `${questionLabels[k] || k}: ${Array.isArray(v) ? v.join(', ') : v}`)

  const leadSummary = `Ref #${lead.referenceNumber} (${lead.clientSlug})\nSource: ${lead.source}\n${answerLines.join('\n')}`

  const followUpMessage = template?.followUpTemplate
    ? fillTemplate(template.followUpTemplate, {
        name: lead.answers.name || 'there',
        referenceNumber: lead.referenceNumber,
        feedbackLink: feedbackLink || '[generate feedback link below]',
      })
    : `Following up on Ref #${lead.referenceNumber}. Feedback link: ${feedbackLink || '[generate below]'}`

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />

      <main className="max-w-3xl mx-auto px-5 py-8 space-y-6">
        <Link to="/admin" className="text-sm text-signal-teal hover:underline">
          ← Back to leads
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs text-ink/50 mb-1">Ref #{lead.referenceNumber}</p>
            <h1 className="text-2xl font-bold">{lead.answers.name || 'Unnamed lead'}</h1>
            <p className="text-sm text-ink/50">
              {lead.clientSlug} · source: {lead.source} · Score {lead.score}
            </p>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        {error && <p className="text-signal-red text-sm">{error}</p>}
        {copyMsg && <p className="text-signal-green text-sm">{copyMsg} copied to clipboard.</p>}

        <section className="bg-white border border-line rounded-card shadow-card p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-ink/60 mb-4">Request Details</h2>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            {Object.entries(lead.answers)
              .filter(([k]) => !['consent', 'website'].includes(k))
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-ink/40 text-xs uppercase tracking-wide mb-0.5">{questionLabels[k] || k}</dt>
                  <dd className="text-ink/90">{Array.isArray(v) ? v.join(', ') || '—' : String(v ?? '—')}</dd>
                </div>
              ))}
          </dl>
          <button onClick={() => copyToClipboard(leadSummary, 'Lead summary')} className="mt-4 text-sm text-signal-teal hover:underline">
            Copy lead summary
          </button>
        </section>

        <section className="bg-white border border-line rounded-card shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-ink/60">Status &amp; Notes</h2>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Status</label>
            <select className="input" value={lead.status} onChange={(e) => saveUpdate({ status: e.target.value })}>
              {LEAD_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Internal notes</label>
            <textarea
              className="input min-h-[80px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => saveUpdate({ internalNotes: notes })}
            />
          </div>
          <button
            onClick={() => saveUpdate({ status: 'Job Completed' })}
            className="text-sm bg-signal-green/10 text-signal-green font-medium px-4 py-2 rounded-card hover:bg-signal-green/20 transition-colors"
          >
            Mark job completed
          </button>
        </section>

        <section className="bg-white border border-line rounded-card shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-ink/60">Customer Follow-up</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => copyToClipboard(followUpMessage, 'Follow-up message')} className="text-sm text-signal-teal hover:underline">
              Copy customer follow-up message
            </button>
            <button onClick={handleGenerateFeedbackLink} className="text-sm text-signal-teal hover:underline">
              Generate feedback link
            </button>
          </div>
          {feedbackLink && <div className="bg-paper border border-line rounded-card p-3 font-mono text-xs break-all">{feedbackLink}</div>}

          {lead.feedback && (
            <div className="border-t border-line pt-4 mt-2">
              <h3 className="font-semibold text-sm text-ink/60 mb-2">Feedback received</h3>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                {Object.entries(lead.feedback).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-ink/40 text-xs uppercase tracking-wide mb-0.5">{k}</dt>
                    <dd className="text-ink/90">{typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v ?? '—')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
