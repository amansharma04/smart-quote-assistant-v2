import { Link, useLocation, useNavigate } from 'react-router-dom'

const LINKS = [
  { to: '/admin', label: 'Leads' },
  { to: '/admin/businesses', label: 'Businesses' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/settings', label: 'Settings' },
]

export default function AdminNav() {
  const location = useLocation()
  const navigate = useNavigate()

  function logout() {
    sessionStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="font-display font-semibold text-base">Smart Quote Assistant</span>
          <nav className="flex gap-4 text-sm">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={
                  location.pathname === link.to
                    ? 'text-signal-tealDark font-medium'
                    : 'text-ink/60 hover:text-signal-teal'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <button onClick={logout} className="text-sm text-ink/50 hover:text-ink">
          Sign out
        </button>
      </div>
    </header>
  )
}
