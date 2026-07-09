import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-5 py-12 w-full">
        <h1 className="text-2xl font-bold mb-6">Terms of Use</h1>
        <div className="space-y-4 text-sm text-ink/80 leading-relaxed">
          <p>
            By submitting a diagnostic intake request through this site, you agree to the
            following terms.
          </p>
          <h2 className="font-semibold text-base mt-6">Service description</h2>
          <p>
            This site collects diagnostic information about your service request and routes
            qualified requests to licensed service professionals serving your area. This
            site is not itself an service provider and does not perform repairs.
          </p>
          <h2 className="font-semibold text-base mt-6">No guarantee of response</h2>
          <p>
            While we make reasonable efforts to route your request promptly, we do not guarantee
            a response time, availability of technicians, or pricing from any local business.
          </p>
          <h2 className="font-semibold text-base mt-6">Accuracy of information</h2>
          <p>
            You are responsible for providing accurate contact and system information. Inaccurate
            information may delay or prevent a technician from responding to your request.
          </p>
          <h2 className="font-semibold text-base mt-6">Consent to contact</h2>
          <p>
            By checking the consent box on the intake form, you agree to be contacted by phone,
            text, or email regarding your request.
          </p>
          <h2 className="font-semibold text-base mt-6">Changes</h2>
          <p>These terms may be updated from time to time without prior notice.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
