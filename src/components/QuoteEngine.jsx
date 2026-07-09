function isVisible(question, values) {
  if (!question.conditional) return true
  const { field, equals } = question.conditional
  return values[field] === equals
}

function optionsForQuestion(question, industry) {
  if (question.optionsFrom === 'serviceCategories') {
    return industry.serviceCategories.map((c) => c.label)
  }
  return question.options || []
}

export default function QuoteEngine({ industry, questions, values, onChange, errors, theme }) {
  const questionList = questions || industry.questions
  const visibleQuestions = questionList.filter((q) => isVisible(q, values))
  const requiredCount = visibleQuestions.filter((q) => q.required).length
  const answeredCount = visibleQuestions.filter((q) => {
    if (!q.required) return false
    const v = values[q.id]
    if (Array.isArray(v)) return v.length > 0
    return v !== undefined && v !== null && v !== ''
  }).length
  const progress = requiredCount ? Math.round((answeredCount / requiredCount) * 100) : 0

  return (
    <div>
      <div className="mb-6">
        <div className="h-1.5 bg-line rounded-full overflow-hidden">
          <div
            className={`h-full ${theme.accentBg} transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-5">
        {visibleQuestions.map((question) => (
          <QuestionField
            key={question.id}
            question={question}
            value={values[question.id]}
            onChange={(v) => onChange(question.id, v)}
            error={errors[question.id]}
            options={optionsForQuestion(question, industry)}
            theme={theme}
          />
        ))}
      </div>
    </div>
  )
}

function QuestionField({ question, value, onChange, error, options, theme }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink/70 mb-1.5">
        {question.label} {question.required && <span className={theme.accentText}>*</span>}
      </label>

      {question.type === 'boolean' && (
        <div className="flex gap-2">
          {[
            { label: 'Yes', v: true },
            { label: 'No', v: false },
          ].map((opt) => (
            <button
              type="button"
              key={opt.label}
              onClick={() => onChange(opt.v)}
              className={`px-4 py-2 ${theme.radius} border text-sm ${
                value === opt.v ? 'border-signal-teal bg-signal-teal/10 text-signal-tealDark font-medium' : `${theme.border} text-ink/70`
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {question.type === 'rating' && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => onChange(n)}
              aria-label={`${n} star`}
              className={`w-10 h-10 ${theme.radius} border text-sm font-mono ${
                value >= n ? 'border-signal-amber bg-signal-amber/10 text-signal-amber' : `${theme.border} text-ink/40`
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {question.type === 'radio' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(opt)}
              className={`text-sm ${theme.radius} border px-3 py-2.5 text-left transition-colors ${
                value === opt
                  ? `border-signal-teal bg-signal-teal/10 text-signal-tealDark font-medium`
                  : `${theme.border} hover:border-signal-teal/50 text-ink/80`
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === 'dropdown' && (
        <select className="input" value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select one</option>
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      )}

      {(question.type === 'multi-select' || question.type === 'checkbox') && (
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => {
            const arr = Array.isArray(value) ? value : []
            const checked = arr.includes(opt)
            return (
              <label
                key={opt}
                className={`flex items-center gap-2 text-sm ${theme.radius} border px-3 py-2.5 cursor-pointer ${
                  checked ? 'border-signal-teal bg-signal-teal/10' : theme.border
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-signal-teal"
                  checked={checked}
                  onChange={() => onChange(checked ? arr.filter((v) => v !== opt) : [...arr, opt])}
                />
                {opt}
              </label>
            )
          })}
        </div>
      )}

      {question.type === 'textarea' && (
        <textarea
          className="input min-h-[90px]"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
        />
      )}

      {question.type === 'text' && (
        <input
          className="input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
        />
      )}

      {question.type === 'phone' && (
        <input
          className="input"
          type="tel"
          inputMode="tel"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
        />
      )}

      {question.type === 'email' && (
        <input className="input" type="email" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )}

      {question.type === 'number' && (
        <input
          className="input"
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      )}

      {question.type === 'date' && (
        <input className="input" type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )}

      {error && <p className="text-signal-red text-xs mt-1.5">{error}</p>}
    </div>
  )
}
