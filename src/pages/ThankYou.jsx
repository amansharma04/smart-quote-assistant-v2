import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function ThankYou() {
  const { refNumber } = useParams()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-5 py-16 w-full text-center">
        <div className="w-14 h-14 rounded-full bg-signal-green/10 text-signal-green flex items-center justify-center mx-auto mb-6 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">Diagnostic request received</h1>
        <p className="text-ink/60 mb-8">
          A licensed technician in your area will review your intake and reach out at your
          preferred contact time.
        </p>
        <div className="ticket-edge bg-white border border-line rounded-card shadow-card p-6 inline-block">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-1">
            Reference Number
          </p>
          <p className="font-mono text-2xl font-semibold text-signal-tealDark">{refNumber}</p>
        </div>
        <p className="text-sm text-ink/50 mt-8">
          Keep this reference number for your records. <Link to="/" className="text-signal-teal hover:underline">Submit another request</Link>.
        </p>
      </main>
      <Footer />
    </div>
  )
}
