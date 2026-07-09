import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-5 py-12 w-full prose-sm">
        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
        <div className="space-y-4 text-sm text-ink/80 leading-relaxed">
          <p>
            This page describes how information submitted through this diagnostic intake form is
            collected, used, and shared.
          </p>
          <h2 className="font-semibold text-base mt-6">Information we collect</h2>
          <p>
            When you submit a diagnostic intake request, we collect the details you provide about
            the details of your request, your contact information, and your general location (city and ZIP
            code). We do not collect payment information through this form.
          </p>
          <h2 className="font-semibold text-base mt-6">How we use your information</h2>
          <p>
            We use the information you submit to route your request to a qualified local business
            or company serving your area, and to follow up with you about the status of your
            request or to request feedback after a job is completed.
          </p>
          <h2 className="font-semibold text-base mt-6">Sharing</h2>
          <p>
            Your diagnostic details and contact information may be shared with one local business
            selected to respond to your request. We do not sell your information to third parties.
          </p>
          <h2 className="font-semibold text-base mt-6">Your choices</h2>
          <p>
            You may request that we delete your information by contacting us using the details
            provided in your confirmation. Providing consent to be contacted is required to submit
            a request, but you may withdraw at any time.
          </p>
          <h2 className="font-semibold text-base mt-6">Contact</h2>
          <p>Questions about this policy can be directed to the contact listed on this site.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
