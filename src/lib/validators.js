const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9()+\-.\s]{7,20}$/
const ZIP_RE = /^\d{5}(-\d{4})?$/

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Quoted',
  'Job Completed',
  'Feedback Requested',
  'Feedback Received',
  'Rejected',
]

export const BUSINESS_STATUSES = ['Prospect', 'Trial', 'Active', 'Paused', 'Rejected']

export function sanitizeText(value, maxLen = 1000) {
  if (typeof value !== 'string') return ''
  return value.replace(/[<>]/g, '').trim().slice(0, maxLen)
}

function validateField(question, rawValue) {
  const errors = []
  let value

  switch (question.type) {
    case 'boolean':
      value = rawValue === true || rawValue === false ? rawValue : null
      if (question.required && value === null) errors.push(`${question.label} is required.`)
      break
    case 'rating': {
      const n = Number(rawValue)
      value = Number.isInteger(n) && n >= 1 && n <= 5 ? n : null
      if (question.required && value === null) errors.push(`${question.label} must be between 1 and 5.`)
      break
    }
    case 'number': {
      const n = Number(rawValue)
      value = Number.isFinite(n) ? n : null
      if (question.required && value === null) errors.push(`${question.label} is required.`)
      break
    }
    case 'multi-select':
    case 'checkbox':
      value = Array.isArray(rawValue) ? rawValue.map((v) => sanitizeText(String(v), 100)) : []
      if (question.required && value.length === 0) errors.push(`${question.label} is required.`)
      break
    default: {
      value = sanitizeText(rawValue, question.maxLength || 1000)
      if (question.required && !value) errors.push(`${question.label} is required.`)
      if (value && question.type === 'email' && !EMAIL_RE.test(value)) {
        errors.push('Enter a valid email address.')
      }
      if (value && question.type === 'phone' && !PHONE_RE.test(value)) {
        errors.push('Enter a valid phone number.')
      }
      if (value && question.validate === 'zip' && !ZIP_RE.test(value)) {
        errors.push('Enter a valid 5-digit ZIP code.')
      }
    }
  }

  return { value, errors }
}

/**
 * Validates a lead submission against an industry config's `questions` array.
 * Returns { clean, errors, isValid }. `clean` always includes consent and the
 * honeypot field regardless of industry config.
 */
export function validateLeadPayload(industryConfig, input) {
  const errors = {}
  const clean = {}

  for (const question of industryConfig.questions) {
    const { value, errors: fieldErrors } = validateField(question, input[question.id])
    clean[question.id] = value
    if (fieldErrors.length) errors[question.id] = fieldErrors[0]
  }

  clean.consent = input.consent === true
  if (!clean.consent) errors.consent = 'Consent is required to submit this request.'

  // Honeypot: bots fill this hidden field. Humans leave it blank.
  clean.website = sanitizeText(input.website, 100)

  clean.city = sanitizeText(input.city, 100)
  if (!clean.city) errors.city = 'City is required.'

  return { clean, errors, isValid: Object.keys(errors).length === 0 }
}

/**
 * Validates a feedback submission against an industry config's
 * `feedbackQuestions` array.
 */
export function validateFeedbackPayload(industryConfig, input) {
  const errors = {}
  const clean = {}

  for (const question of industryConfig.feedbackQuestions) {
    const { value, errors: fieldErrors } = validateField(question, input[question.id])
    clean[question.id] = value
    if (fieldErrors.length) errors[question.id] = fieldErrors[0]
  }

  return { clean, errors, isValid: Object.keys(errors).length === 0 }
}

/**
 * Computes a numeric lead score from an industry config's `leadScoringRules`.
 * Rules are simple field-based conditions summed together — deliberately
 * simple for the MVP; can be swapped for a more advanced engine later
 * without changing the config shape.
 */
export function scoreLead(industryConfig, cleanAnswers) {
  const rules = industryConfig.leadScoringRules || []
  let score = 0

  for (const rule of rules) {
    const fieldValue = cleanAnswers[rule.when.field]
    if (rule.when.equals !== undefined && fieldValue === rule.when.equals) {
      score += rule.addPoints
    } else if (rule.when.notEmpty && fieldValue) {
      score += rule.addPoints
    }
  }

  return score
}

export function fillTemplate(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => (values[key] !== undefined ? values[key] : ''))
}
