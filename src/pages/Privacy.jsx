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
            This page describes how information submitted through a quote request form is
            collected, used, and shared.
          </p>
          <h2 className="font-semibold text-base mt-6">Information we collect</h2>
          <p>
            When you submit a quote request, we collect the details you provide about your
            request and your contact information. We do not collect payment information through
            this form.
          </p>
          <h2 className="font-semibold text-base mt-6">How your information is used</h2>
          <p>
            Your request is sent directly to the business whose page you submitted it on, so they
            can follow up with you about your request. It may also be used to request feedback
            after your service is completed.
          </p>
          <h2 className="font-semibold text-base mt-6">Sharing</h2>
          <p>
            Your request details and contact information are shared only with the business you
            submitted the request to. We do not sell your information to third parties.
          </p>
          <h2 className="font-semibold text-base mt-6">Your choices</h2>
          <p>
            You may request that your information be deleted by contacting the business directly,
            or by contacting us using the details provided in your confirmation. Providing consent
            to be contacted is required to submit a request, but you may withdraw at any time.
          </p>
          <h2 className="font-semibold text-base mt-6">Contact</h2>
          <p>Questions about this policy can be directed to the contact listed on this site.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
