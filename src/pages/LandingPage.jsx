import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import QuoteEngine from '../components/QuoteEngine.jsx'
import NotFound from './NotFound.jsx'
import { useOverrides } from '../hooks/useOverrides.js'
import { parseLandingSlug } from '../lib/routeMatch.js'
import { getTheme } from '../config/themes.js'
import { useSeo, buildSeo } from '../lib/seo.js'
import { api } from '../lib/api.js'

export default function LandingPage() {
  const { combinedSlug } = useParams()
  const navigate = useNavigate()
  const { overrides, loading } = useOverrides()

  const [values, setValues] = useState({ consent: false, website: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const match = loading ? null : parseLandingSlug(combinedSlug, overrides)
  const industry = match?.industry || null
  const city = match?.city || null
  const theme = getTheme(industry?.theme)
  const seo = industry ? buildSeo(industry, city) : { title: '', description: '' }

  // Always call hooks in the same order, even before we know whether this
  // slug resolves to a real page — the NotFound branch happens in the JSX
  // below, not via an early return.
  useSeo({ ...seo, path: `/${combinedSlug}` })

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    if (!values.consent) {
      setErrors((er) => ({ ...er, consent: 'Consent is required to submit this request.' }))
      return
    }

    setSubmitting(true)
    try {
      const result = await api.submitLead({
        industryId: industry.id,
        citySlug: city ? city.slug : '',
        city: city ? city.city : '',
        ...values,
      })
      navigate(`/thank-you/${result.referenceNumber}`)
    } catch (err) {
      setSubmitError(err.message || 'We could not submit your request. Please try again.')
      setErrors(err.fieldErrors || {})
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null
  if (!match) return <NotFound />

  return (
    <div className={`min-h-screen flex flex-col ${theme.pageBg}`}>
      <Header theme={theme} />

      <main className="flex-1 max-w-3xl mx-auto px-5 py-10 w-full">
        <div className="mb-8">
          <p className={`font-mono text-xs tracking-widest ${theme.accentText} uppercase mb-3`}>
            {city ? `${city.city}, ${city.state}` : 'Serving your area'} — Diagnostic Intake
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight mb-3">
            {industry.hero.headline}
          </h1>
          <p className="text-ink/60 text-base max-w-xl mb-3">{industry.hero.description}</p>
          {city && <p className="text-sm text-ink/50">{city.localIntro}</p>}
          <div className="flex flex-wrap gap-2 mt-4">
            {industry.trustBadges.map((badge) => (
              <span key={badge} className="status-tag bg-signal-teal/10 text-signal-tealDark">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={`ticket-edge ${theme.cardBg} border ${theme.border} ${theme.radius} shadow-card p-6 sm:p-8`}>
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website">Leave this field blank</label>
              <input
                id="website"
                type="text"
                tabIndex="-1"
                autoComplete="off"
                value={values.website}
                onChange={(e) => update('website', e.target.value)}
              />
            </div>

            <QuoteEngine industry={industry} values={values} onChange={update} errors={errors} theme={theme} />

            <label className="flex items-start gap-3 my-6 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-signal-teal"
                checked={values.consent}
                onChange={(e) => update('consent', e.target.checked)}
              />
              <span className="text-sm text-ink/80">
                I agree to be contacted about my request by phone, text, or email.
              </span>
            </label>
            {errors.consent && <p className="text-signal-red text-xs -mt-4 mb-4">{errors.consent}</p>}

            {submitError && <p className="text-signal-red text-sm mb-4">{submitError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full sm:w-auto ${theme.accentBg} ${theme.accentBgHover} disabled:opacity-60 text-white font-medium ${theme.radius} px-6 py-3 transition-colors`}
            >
              {submitting ? 'Submitting…' : industry.hero.cta}
            </button>
          </div>
        </form>

        {industry.faqs?.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display font-semibold text-lg mb-4">Frequently asked questions</h2>
            <div className="space-y-4">
              {industry.faqs.map((faq) => (
                <div key={faq.q}>
                  <p className="font-medium text-sm text-ink/90">{faq.q}</p>
                  <p className="text-sm text-ink/60 mt-1">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
