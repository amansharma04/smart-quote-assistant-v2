import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNav from '../../components/AdminNav.jsx'
import { listIndustries } from '../../config/industries/index.js'
import { listCities } from '../../config/cities/index.js'
import { getEffectiveIndustries } from '../../lib/siteConfig.js'
import { api } from '../../lib/api.js'

export default function AdminSettings() {
  const navigate = useNavigate()
  const token = sessionStorage.getItem('admin_token')

  const industries = listIndustries()
  const cities = listCities()

  const [overrides, setOverrides] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [editingHero, setEditingHero] = useState(null)

  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
      return
    }
    api
      .getSiteConfigAdmin(token)
      .then((data) => setOverrides(data.overrides || {}))
      .catch((err) => setError(err.message || 'Failed to load settings.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function persist(next) {
    setOverrides(next)
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await api.saveSiteConfig(token, next)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (err) {
      setError(err.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  function toggleIndustry(slug, enabled) {
    const next = {
      ...overrides,
      industries: {
        ...overrides.industries,
        [slug]: { ...(overrides.industries?.[slug] || {}), enabled },
      },
    }
    persist(next)
  }

  function toggleCity(slug, enabled) {
    const next = {
      ...overrides,
      cities: { ...overrides.cities, [slug]: { ...(overrides.cities?.[slug] || {}), enabled } },
    }
    persist(next)
  }

  function moveIndustry(slug, direction) {
    const effective = getEffectiveIndustries(overrides).map((i) => i.slug)
    const idx = effective.indexOf(slug)
    const swapWith = idx + direction
    if (swapWith < 0 || swapWith >= effective.length) return
    const order = [...effective]
    ;[order[idx], order[swapWith]] = [order[swapWith], order[idx]]
    persist({ ...overrides, homepageOrder: order })
  }

  function saveHeroEdit(slug, hero, faqs) {
    const next = {
      ...overrides,
      industries: { ...overrides.industries, [slug]: { ...(overrides.industries?.[slug] || {}), hero, faqs } },
    }
    persist(next)
    setEditingHero(null)
  }

  if (loading || !overrides) {
    return (
      <div className="min-h-screen bg-paper">
        <AdminNav />
        <main className="max-w-3xl mx-auto px-5 py-8 text-sm text-ink/50">Loading…</main>
      </div>
    )
  }

  const orderedIndustries = getEffectiveIndustries(overrides)

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-5 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Settings</h1>
          {saving && <span className="text-xs text-ink/40">Saving…</span>}
          {saved && <span className="text-xs text-signal-green">Saved</span>}
        </div>
        {error && <p className="text-signal-red text-sm">{error}</p>}

        <section className="bg-white border border-line rounded-card shadow-card p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-ink/60 mb-4">
            Industries (homepage order &amp; visibility)
          </h2>
          <div className="space-y-2">
            {orderedIndustries.map((industry, idx) => (
              <div key={industry.slug} className="flex items-center justify-between border border-line rounded-card px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{industry.displayName}</p>
                  <p className="text-xs text-ink/50">{industry.hero.headline}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => moveIndustry(industry.slug, -1)} disabled={idx === 0} className="text-xs text-ink/50 disabled:opacity-30">
                    ↑
                  </button>
                  <button
                    onClick={() => moveIndustry(industry.slug, 1)}
                    disabled={idx === orderedIndustries.length - 1}
                    className="text-xs text-ink/50 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button onClick={() => setEditingHero(industry)} className="text-xs text-signal-teal hover:underline">
                    Edit
                  </button>
                  <label className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      className="accent-signal-teal"
                      checked={industry.enabled}
                      onChange={(e) => toggleIndustry(industry.slug, e.target.checked)}
                    />
                    Enabled
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-line rounded-card shadow-card p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-ink/60 mb-4">Cities</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {cities.map((city) => {
              const enabled = overrides.cities?.[city.slug]?.enabled ?? city.enabled
              return (
                <label key={city.slug} className="flex items-center justify-between border border-line rounded-card px-4 py-3 text-sm">
                  {city.city}, {city.state}
                  <input type="checkbox" className="accent-signal-teal" checked={enabled} onChange={(e) => toggleCity(city.slug, e.target.checked)} />
                </label>
              )
            })}
          </div>
        </section>
      </main>

      {editingHero && (
        <HeroEditModal industry={editingHero} onClose={() => setEditingHero(null)} onSave={saveHeroEdit} />
      )}
    </div>
  )
}

function HeroEditModal({ industry, onClose, onSave }) {
  const [headline, setHeadline] = useState(industry.hero.headline)
  const [description, setDescription] = useState(industry.hero.description)
  const [cta, setCta] = useState(industry.hero.cta)
  const [faqs, setFaqs] = useState(industry.faqs || [])

  function updateFaq(idx, field, value) {
    setFaqs((f) => f.map((faq, i) => (i === idx ? { ...faq, [field]: value } : faq)))
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-30">
      <div className="bg-white rounded-card shadow-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-4">Edit {industry.displayName}</h2>

        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Hero headline</label>
            <input className="input" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Hero description</label>
            <textarea className="input min-h-[70px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">CTA button text</label>
            <input className="input" value={cta} onChange={(e) => setCta(e.target.value)} />
          </div>
        </div>

        <h3 className="text-sm font-semibold text-ink/60 uppercase tracking-wide mb-2">FAQs</h3>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-line rounded-card p-3 space-y-2">
              <input className="input" value={faq.q} onChange={(e) => updateFaq(idx, 'q', e.target.value)} placeholder="Question" />
              <textarea className="input min-h-[60px]" value={faq.a} onChange={(e) => updateFaq(idx, 'a', e.target.value)} placeholder="Answer" />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(industry.slug, { headline, description, cta }, faqs)}
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
