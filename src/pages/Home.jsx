import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useOverrides } from '../hooks/useOverrides.js'
import { getEffectiveIndustries, getEffectiveCities } from '../lib/siteConfig.js'
import { useSeo } from '../lib/seo.js'

export default function Home() {
  const { overrides, loading } = useOverrides()

  useSeo({
    title: 'Smart Quote Assistant | Get matched with trusted local professionals',
    description: 'Describe your project and get matched with a trusted, local professional. Fast, free, no obligation.',
    path: '/',
  })

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-5 py-16 w-full text-center text-ink/40 text-sm">
          Loading…
        </main>
        <Footer />
      </div>
    )
  }

  const industries = getEffectiveIndustries(overrides, { onlyEnabled: true })
  const cities = getEffectiveCities(overrides, { onlyEnabled: true })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-5 py-14 w-full">
        <p className="font-mono text-xs tracking-widest text-signal-teal uppercase mb-3">
          Local Service Marketplace
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight mb-3">
          Get matched with a trusted local professional
        </h1>
        <p className="text-ink/60 max-w-xl mb-10">
          Tell us what you need. We'll route your request to a qualified business serving your
          area — free, fast, and with no obligation.
        </p>

        <div className="space-y-8">
          {industries.map((industry) => (
            <section key={industry.slug}>
              <h2 className="font-display font-semibold text-lg mb-1">{industry.hero.headline}</h2>
              <p className="text-sm text-ink/60 mb-4">{industry.hero.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    to={`/${city.slug}-${industry.slug}`}
                    className="text-sm border border-line rounded-card px-3 py-2.5 hover:border-signal-teal/50 hover:bg-white transition-colors bg-white/60"
                  >
                    {city.city}, {city.state}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
