import { Link } from 'react-router-dom'

export default function Header({ theme }) {
  const t = theme || { pageBg: 'bg-paper', border: 'border-line', accentText: 'text-signal-teal' }
  return (
    <header className={`border-b ${t.border} bg-paper/95 backdrop-blur sticky top-0 z-20`}>
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${t.accentBg || 'bg-signal-teal'}`} aria-hidden="true" />
          <span className="font-display text-sm tracking-wide text-ink font-semibold">
            Smart Quote Assistant
          </span>
        </Link>
      </div>
    </header>
  )
}
