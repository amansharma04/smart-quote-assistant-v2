import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-line mt-16">
      <div className="max-w-3xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink/50 font-mono">
        <span>© {new Date().getFullYear()} Smart Quote Assistant</span>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-signal-teal transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-signal-teal transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}
