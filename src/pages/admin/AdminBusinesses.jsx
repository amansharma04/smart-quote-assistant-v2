import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNav from '../../components/AdminNav.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { BUSINESS_STATUSES } from '../../lib/validators.js'
import { listIndustries } from '../../config/industries/index.js'
import { listCities } from '../../config/cities/index.js'
import { api } from '../../lib/api.js'

const emptyBusiness = {
  businessId: '',
  industryId: '',
  companyName: '',
  ownerName: '',
  phone: '',
  email: '',
  website: '',
  serviceArea: '',
  cities: [],
  status: 'Prospect',
  pricing: '',
  notes: '',
}

export default function AdminBusinesses() {
  const navigate = useNavigate()
  const token = sessionStorage.getItem('admin_token')
  const industries = listIndustries()
  const cities = listCities()

  const [businesses, setBusinesses] = useState([])
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
      const data = await api.listBusinesses(token)
      setBusinesses(data.businesses || [])
    } catch (err) {
      setError(err.message || 'Failed to load businesses.')
    } finally {
      setLoading(false)
    }
  }

  async function save(business) {
    setError('')
    try {
      await api.saveBusiness(token, business)
      setEditing(null)
      await load()
    } catch (err) {
      setError(err.message || 'Save failed.')
    }
  }

  function industryLabel(id) {
    return industries.find((i) => i.id === id)?.displayName || id || '—'
  }

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="max-w-4xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Businesses</h1>
          <button
            onClick={() => setEditing({ ...emptyBusiness, industryId: industries[0]?.id || '' })}
            className="text-sm bg-signal-teal text-white font-medium px-4 py-2 rounded-card hover:bg-signal-tealDark transition-colors"
          >
            Add business
          </button>
        </div>

        {error && <p className="text-signal-red text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-ink/50 text-sm">Loading…</p>
        ) : businesses.length === 0 ? (
          <p className="text-ink/50 text-sm">No businesses added yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {businesses.map((b) => (
              <button
                key={b.businessId}
                onClick={() => setEditing(b)}
                className="text-left bg-white border border-line rounded-card shadow-card p-5 hover:border-signal-teal/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{b.companyName}</h3>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-xs text-ink/50">{industryLabel(b.industryId)} · {b.serviceArea}</p>
                <p className="text-xs text-ink/50">{b.phone} {b.email && `· ${b.email}`}</p>
              </button>
            ))}
          </div>
        )}
      </main>

      {editing && (
        <BusinessModal
          business={editing}
          industries={industries}
          cities={cities}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  )
}

function BusinessModal({ business, industries, cities, onClose, onSave }) {
  const [form, setForm] = useState(business)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleCity(slug) {
    setForm((f) => ({
      ...f,
      cities: f.cities.includes(slug) ? f.cities.filter((c) => c !== slug) : [...f.cities, slug],
    }))
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-30">
      <div className="bg-white rounded-card shadow-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-4">{form.businessId ? 'Edit' : 'New'} Business</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Industry</label>
            <select className="input" value={form.industryId} onChange={(e) => update('industryId', e.target.value)}>
              {industries.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.displayName}
                </option>
              ))}
            </select>
          </div>
          <LabeledInput label="Company name" value={form.companyName} onChange={(v) => update('companyName', v)} />
          <LabeledInput label="Owner / manager name" value={form.ownerName} onChange={(v) => update('ownerName', v)} />
          <LabeledInput label="Phone" value={form.phone} onChange={(v) => update('phone', v)} />
          <LabeledInput label="Email" value={form.email} onChange={(v) => update('email', v)} />
          <LabeledInput label="Website" value={form.website} onChange={(v) => update('website', v)} />
          <LabeledInput label="Service area" value={form.serviceArea} onChange={(v) => update('serviceArea', v)} />
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Cities served</label>
            <div className="grid grid-cols-2 gap-2">
              {cities.map((c) => (
                <label key={c.slug} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.cities.includes(c.slug)} onChange={() => toggleCity(c.slug)} className="accent-signal-teal" />
                  {c.city}
                </label>
              ))}
            </div>
          </div>
          <LabeledInput label="Lead price" value={form.pricing} onChange={(v) => update('pricing', v)} />
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Status</label>
            <select className="input" value={form.status} onChange={(e) => update('status', e.target.value)}>
              {BUSINESS_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Notes</label>
            <textarea className="input min-h-[70px]" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="bg-signal-teal text-white font-medium px-4 py-2 rounded-card hover:bg-signal-tealDark transition-colors">
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

function LabeledInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink/70 mb-1.5">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
