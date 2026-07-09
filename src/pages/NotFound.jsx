import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-xl mx-auto px-5 py-24 w-full text-center">
        <p className="font-mono text-signal-teal text-sm mb-3">404</p>
        <h1 className="text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-ink/60 mb-6">The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="text-signal-teal hover:underline font-medium">
          Return to diagnostic intake
        </Link>
      </main>
      <Footer />
    </div>
  )
}
