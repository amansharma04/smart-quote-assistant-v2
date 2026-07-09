import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import QuoteEngine from '../components/QuoteEngine.jsx'
import NotFound from './NotFound.jsx'
import { useSeo } from '../lib/seo.js'
import { api } from '../lib/api.js'

const THEME = {
  radius: 'rounded-card',
  border: 'border-line',
  cardBg: 'bg-white',
  accentBg: 'brand-bg',
  accentText: 'brand-text',
  accentBorder: 'brand-border',
  accentBgSoft: 'brand-bg-soft',
  accentTextStrong: 'brand-text',
  accentAccent: 'brand-accent',
}

export default function ClientPage() {
  const { clientSlug } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const source = searchParams.get('source') || 'website'

  const [client, setClient] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  const [values, setValues] = useState({ consent: false, website: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    api
      .getClient(clientSlug)
      .then((data) => setClient(data.client))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [clientSlug])

  useSeo({
    title: client ? client.seo.title : '',
    description: client ? client.seo.description : '',
    ogImage: client?.seo?.ogImage,
    path: `/${clientSlug}`,
  })

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
      const result = await api.submitLead({ clientSlug, source, ...values })
      navigate(`/thank-you/${result.referenceNumber}`)
    } catch (err) {
      setSubmitError(err.message || 'We could not submit your request. Please try again.')
      setErrors(err.fieldErrors || {})
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null
  if (notFound || !client) return <NotFound />

  return (
    <div className="min-h-screen flex flex-col bg-paper" style={{ '--brand': client.brandColor }}>
      <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          {client.logo ? (
            <img src={client.logo} alt={client.businessName} className="h-8 w-auto" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full brand-bg" aria-hidden="true" />
          )}
          <span className="font-display text-sm tracking-wide text-ink font-semibold">{client.businessName}</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-5 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight mb-3">{client.headline}</h1>
          <p className="text-ink/60 text-base max-w-xl mb-3">{client.subheadline}</p>
          {client.serviceArea && <p className="text-sm text-ink/50">Serving {client.serviceArea}</p>}
          {client.services?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {client.services.map((s) => (
                <span key={s} className="status-tag brand-bg-soft brand-text">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={`ticket-edge ${THEME.cardBg} border ${THEME.border} ${THEME.radius} shadow-card p-6 sm:p-8`}>
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

            <QuoteEngine
              industry={{ questions: client.questions, serviceCategories: client.serviceCategories }}
              values={values}
              onChange={update}
              errors={errors}
              theme={THEME}
            />

            <label className="flex items-start gap-3 my-6 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 brand-accent"
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
              className="w-full sm:w-auto brand-bg hover:opacity-90 disabled:opacity-60 text-white font-medium rounded-card px-6 py-3 transition-opacity"
            >
              {submitting ? 'Submitting…' : client.submitButtonText}
            </button>
          </div>
        </form>

        {client.faqs?.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display font-semibold text-lg mb-4">Frequently asked questions</h2>
            <div className="space-y-4">
              {client.faqs.map((faq) => (
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
