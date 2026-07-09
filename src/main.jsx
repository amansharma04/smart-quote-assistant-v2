import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import Home from './pages/Home.jsx'
import ClientPage from './pages/ClientPage.jsx'
import ThankYou from './pages/ThankYou.jsx'
import Feedback from './pages/Feedback.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminLeadDetail from './pages/admin/AdminLeadDetail.jsx'
import AdminClients from './pages/admin/AdminClients.jsx'
import AdminClientLinks from './pages/admin/AdminClientLinks.jsx'
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx'
import NotFound from './pages/NotFound.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/thank-you/:refNumber" element={<ThankYou />} />
        <Route path="/feedback/:leadId/:token" element={<Feedback />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/leads/:leadId" element={<AdminLeadDetail />} />
        <Route path="/admin/clients" element={<AdminClients />} />
        <Route path="/admin/clients/:clientId/links" element={<AdminClientLinks />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />

        {/* One component renders every business client's dedicated quote
            page, e.g. /calpro, /abc-heating, /demo-hvac */}
        <Route path="/:clientSlug" element={<ClientPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
