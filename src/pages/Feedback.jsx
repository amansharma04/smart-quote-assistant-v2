import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import QuoteEngine from '../components/QuoteEngine.jsx'
import { getIndustry } from '../config/industries/index.js'
import { getTheme } from '../config/themes.js'
import { api } from '../lib/api.js'

export default function Feedback() {
  const { leadId, token } = useParams()
  const [context, setContext] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    api
      .feedbackContext(leadId, token)
      .then((data) => setContext(data))
      .catch((err) => setLoadError(err.message || 'This feedback link is invalid or has expired.'))
      .finally(() => setLoading(false))
  }, [leadId, token])

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      await api.submitFeedback({ leadId, token, ...values })
      setDone(true)
    } catch (err) {
      setSubmitError(err.message || 'We could not submit your feedback.')
      setErrors(err.fieldErrors || {})
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  if (loadError || !context) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-xl mx-auto px-5 py-16 w-full text-center">
          <h1 className="text-2xl font-bold mb-3">Link unavailable</h1>
          <p className="text-ink/60">{loadError || 'This feedback link is invalid or has expired.'}</p>
        </main>
        <Footer />
      </div>
    )
  }

  const industry = getIndustry(context.industryId)
  const theme = getTheme(industry?.theme)

  if (done || context.alreadySubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header theme={theme} />
        <main className="flex-1 max-w-xl mx-auto px-5 py-16 w-full text-center">
          <h1 className="text-2xl font-bold mb-3">Thanks for the feedback</h1>
          <p className="text-ink/60">Your response has been recorded. We appreciate you taking the time.</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header theme={theme} />
      <main className="flex-1 max-w-xl mx-auto px-5 py-12 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">How did it go?</h1>
        <p className="text-ink/60 mb-8">A quick follow-up on your recent request (Ref #{context.referenceNumber}).</p>

        <form
          onSubmit={handleSubmit}
          className={`ticket-edge ${theme.cardBg} border ${theme.border} ${theme.radius} shadow-card p-6 sm:p-8`}
        >
          <QuoteEngine
            industry={industry}
            questions={industry.feedbackQuestions}
            values={values}
            onChange={update}
            errors={errors}
            theme={theme}
          />

          {submitError && <p className="text-signal-red text-sm mt-4">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={`mt-6 w-full sm:w-auto ${theme.accentBg} ${theme.accentBgHover} disabled:opacity-60 text-white font-medium ${theme.radius} px-6 py-3 transition-colors`}
          >
            {submitting ? 'Submitting…' : 'Submit Feedback'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  )
}
