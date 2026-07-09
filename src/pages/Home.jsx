import { Link } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import { useSeo } from '../lib/seo.js'

export default function Home() {
  useSeo({
    title: 'Smart Quote Assistant | Convert More Website Visitors Into Qualified Leads',
    description:
      'Smart Quote Assistant replaces basic contact forms with guided quote flows for your website, social media, Google Business Profile, QR codes, and campaigns.',
    path: '/',
  })

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <span className="font-display font-semibold text-base">Smart Quote Assistant</span>
          <a href="mailto:hello@smartquoteassistant.com?subject=Demo request" className="text-sm text-signal-teal hover:underline">
            Book a Demo
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-5 pt-20 pb-16 text-center">
          <p className="font-mono text-xs tracking-widest text-signal-teal uppercase mb-4">
            For local service businesses
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-ink leading-tight mb-5">
            Convert More Website Visitors Into Qualified Leads
          </h1>
          <p className="text-ink/60 text-lg max-w-xl mx-auto mb-8">
            Smart Quote Assistant replaces basic contact forms with guided quote flows for your
            website, social media, Google Business Profile, QR codes, and campaigns.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:hello@smartquoteassistant.com?subject=Demo request"
              className="bg-signal-teal hover:bg-signal-tealDark text-white font-medium rounded-card px-6 py-3 transition-colors"
            >
              Book a Demo
            </a>
            <Link
              to="/demo-hvac"
              className="bg-white border border-line hover:border-signal-teal/50 text-ink font-medium rounded-card px-6 py-3 transition-colors"
            >
              View Live Demo
            </Link>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-5 py-16 border-t border-line">
          <div className="grid sm:grid-cols-3 gap-8">
            <Feature
              title="Guided, not generic"
              body="Every question is specific to your industry — no more one-size-fits-all contact forms that lose detail."
            />
            <Feature
              title="Works everywhere you show up"
              body="One dedicated link for your website, Instagram, Facebook, Google Business Profile, QR codes, email, and SMS — each tracked by source."
            />
            <Feature
              title="Live in minutes"
              body="Your own branded quote page with your logo and colors, no developer required, no code changes for updates."
            />
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-5 py-16 border-t border-line">
          <h2 className="font-display font-semibold text-2xl mb-6 text-center">How it works</h2>
          <div className="space-y-6">
            <Step
              n="1"
              title="We set up your page"
              body="Your business name, logo, brand color, services, and a question flow tailored to your industry."
            />
            <Step
              n="2"
              title="Share your link everywhere"
              body="Put it in your Instagram bio, Google Business Profile, email signature, or print it as a QR code on a truck or yard sign."
            />
            <Step
              n="3"
              title="Get organized, qualified leads"
              body="Every submission lands in your dashboard with full details, source, and status — ready to follow up on."
            />
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-5 py-16 border-t border-line text-center">
          <h2 className="font-display font-semibold text-2xl mb-3">See it in action</h2>
          <p className="text-ink/60 mb-6">
            Take a look at a live example built for an HVAC company.
          </p>
          <Link
            to="/demo-hvac"
            className="inline-block bg-signal-teal hover:bg-signal-tealDark text-white font-medium rounded-card px-6 py-3 transition-colors"
          >
            View Live Demo
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function Feature({ title, body }) {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      <p className="text-sm text-ink/60 leading-relaxed">{body}</p>
    </div>
  )
}

function Step({ n, title, body }) {
  return (
    <div className="flex gap-4">
      <span className="font-mono text-sm text-signal-teal font-semibold shrink-0 w-6">{n}</span>
      <div>
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-sm text-ink/60 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}
