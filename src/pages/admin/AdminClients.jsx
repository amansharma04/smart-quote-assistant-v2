import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminNav from '../../components/AdminNav.jsx'
import { listIndustries } from '../../config/industries/index.js'
import { api } from '../../lib/api.js'

const emptyClient = {
  clientId: '',
  slug: '',
  businessName: '',
  logo: '',
  brandColor: '#0E7C86',
  industryTemplateId: '',
  services: [],
  extraQuestions: [],
  notificationEmail: '',
  secondaryNotifyEmail: '',
  phone: '',
  website: '',
  serviceArea: '',
  headline: '',
  subheadline: '',
  submitButtonText: '',
  enabled: true,
}

export default function AdminClients() {
  const navigate = useNavigate()
  const token = sessionStorage.getItem('admin_token')
  const templates = listIndustries()

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
      return
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await api.listClients(token)
      setClients(data.clients || [])
    } catch (err) {
      setError(err.message || 'Failed to load clients.')
    } finally {
      setLoading(false)
    }
  }

  async function save(client) {
    setError('')
    try {
      await api.saveClient(token, client)
      setEditing(null)
      await load()
    } catch (err) {
      setError(err.message || 'Save failed.')
    }
  }

  function templateLabel(id) {
    return templates.find((t) => t.id === id)?.displayName || id
  }

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="max-w-4xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Clients</h1>
          <button
            onClick={() => setEditing({ ...emptyClient, industryTemplateId: templates[0]?.id || '' })}
            className="text-sm bg-signal-teal text-white font-medium px-4 py-2 rounded-card hover:bg-signal-tealDark transition-colors"
          >
            Add client
          </button>
        </div>

        {error && <p className="text-signal-red text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-ink/50 text-sm">Loading…</p>
        ) : clients.length === 0 ? (
          <p className="text-ink/50 text-sm">No clients yet. Add your first one to get a live quote page.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {clients.map((c) => (
              <div key={c.clientId} className="bg-white border border-line rounded-card shadow-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{c.businessName}</h3>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded-full ${
                      c.enabled ? 'bg-signal-green/10 text-signal-green' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {c.enabled ? 'Live' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-ink/50 mb-1">{templateLabel(c.industryTemplateId)} · /{c.slug}</p>
                <p className="text-xs text-ink/50 mb-4">{c.notificationEmail}</p>
                <div className="flex gap-3">
                  <button onClick={() => setEditing(c)} className="text-xs text-signal-teal hover:underline">
                    Edit
                  </button>
                  <Link to={`/admin/clients/${c.clientId}/links`} className="text-xs text-signal-teal hover:underline">
                    Links &amp; QR code
                  </Link>
                  <Link to={`/${c.slug}`} target="_blank" className="text-xs text-ink/50 hover:underline">
                    View page ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {editing && <ClientModal client={editing} templates={templates} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  )
}

function ClientModal({ client, templates, onClose, onSave }) {
  const [form, setForm] = useState(client)
  const [serviceInput, setServiceInput] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function addService() {
    const trimmed = serviceInput.trim()
    if (!trimmed) return
    update('services', [...form.services, trimmed])
    setServiceInput('')
  }

  function removeService(idx) {
    update('services', form.services.filter((_, i) => i !== idx))
  }

  function addQuestion() {
    update('extraQuestions', [
      ...form.extraQuestions,
      { id: `custom_${form.extraQuestions.length + 1}`, type: 'text', label: '', required: false },
    ])
  }

  function updateQuestion(idx, field, value) {
    update(
      'extraQuestions',
      form.extraQuestions.map((q, i) => (i === idx ? { ...q, [field]: value } : q)),
    )
  }

  function removeQuestion(idx) {
    update('extraQuestions', form.extraQuestions.filter((_, i) => i !== idx))
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-30 overflow-y-auto">
      <div className="bg-white rounded-card shadow-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto my-8">
        <h2 className="font-bold text-lg mb-4">{form.clientId ? 'Edit' : 'New'} Client</h2>

        <div className="space-y-3">
          <Labeled label="Business name">
            <input className="input" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} />
          </Labeled>
          <Labeled label="Page slug (e.g. calpro, abc-heating)">
            <input className="input" value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="abc-heating" />
          </Labeled>
          <Labeled label="Industry template">
            <select className="input" value={form.industryTemplateId} onChange={(e) => update('industryTemplateId', e.target.value)}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.displayName}
                </option>
              ))}
            </select>
          </Labeled>
          <Labeled label="Logo URL (optional)">
            <input className="input" value={form.logo} onChange={(e) => update('logo', e.target.value)} />
          </Labeled>
          <Labeled label="Brand color">
            <div className="flex items-center gap-2">
              <input type="color" value={form.brandColor} onChange={(e) => update('brandColor', e.target.value)} className="w-10 h-10 rounded border border-line" />
              <input className="input" value={form.brandColor} onChange={(e) => update('brandColor', e.target.value)} />
            </div>
          </Labeled>

          <Labeled label="Services">
            <div className="flex flex-wrap gap-2 mb-2">
              {form.services.map((s, i) => (
                <span key={i} className="text-xs bg-paper border border-line rounded-full px-3 py-1 flex items-center gap-2">
                  {s}
                  <button type="button" onClick={() => removeService(i)} className="text-ink/40 hover:text-signal-red">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                placeholder="e.g. AC repair"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
              />
              <button type="button" onClick={addService} className="text-sm text-signal-teal px-3 whitespace-nowrap">
                Add
              </button>
            </div>
          </Labeled>

          <Labeled label="Notification email">
            <input className="input" value={form.notificationEmail} onChange={(e) => update('notificationEmail', e.target.value)} />
          </Labeled>
          <Labeled label="Also notify (optional)">
            <input className="input" value={form.secondaryNotifyEmail} onChange={(e) => update('secondaryNotifyEmail', e.target.value)} />
          </Labeled>
          <Labeled label="Phone">
            <input className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </Labeled>
          <Labeled label="Website">
            <input className="input" value={form.website} onChange={(e) => update('website', e.target.value)} />
          </Labeled>
          <Labeled label="Service area">
            <input className="input" value={form.serviceArea} onChange={(e) => update('serviceArea', e.target.value)} />
          </Labeled>

          <Labeled label="Headline (optional override)">
            <input className="input" value={form.headline} onChange={(e) => update('headline', e.target.value)} placeholder={`Request Service From ${form.businessName || '[Business]'}`} />
          </Labeled>
          <Labeled label="Subheadline (optional override)">
            <textarea className="input min-h-[60px]" value={form.subheadline} onChange={(e) => update('subheadline', e.target.value)} />
          </Labeled>
          <Labeled label="Submit button text (optional override)">
            <input className="input" value={form.submitButtonText} onChange={(e) => update('submitButtonText', e.target.value)} placeholder="Submit Service Request" />
          </Labeled>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-ink/70">Custom questions</label>
              <button type="button" onClick={addQuestion} className="text-xs text-signal-teal hover:underline">
                + Add question
              </button>
            </div>
            <div className="space-y-2">
              {form.extraQuestions.map((q, i) => (
                <div key={i} className="border border-line rounded-card p-3 flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      className="input"
                      placeholder="Question label"
                      value={q.label}
                      onChange={(e) => updateQuestion(i, 'label', e.target.value)}
                    />
                    <div className="flex gap-2 items-center">
                      <select className="input" value={q.type} onChange={(e) => updateQuestion(i, 'type', e.target.value)}>
                        <option value="text">Short text</option>
                        <option value="textarea">Long text</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                      <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                        <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(i, 'required', e.target.checked)} className="accent-signal-teal" />
                        Required
                      </label>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeQuestion(i)} className="text-ink/40 hover:text-signal-red text-sm">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.enabled} onChange={(e) => update('enabled', e.target.checked)} className="accent-signal-teal" />
            Page is live
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(form)}
            className="bg-signal-teal text-white font-medium px-4 py-2 rounded-card hover:bg-signal-tealDark transition-colors"
          >
            Save
          </button>
          <button onClick={onClose} className="text-ink/60 px-4 py-2">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function Labeled({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink/70 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
