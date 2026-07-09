import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import Home from './pages/Home.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ThankYou from './pages/ThankYou.jsx'
import Feedback from './pages/Feedback.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminLeadDetail from './pages/admin/AdminLeadDetail.jsx'
import AdminBusinesses from './pages/admin/AdminBusinesses.jsx'
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'
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
        <Route path="/admin/businesses" element={<AdminBusinesses />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Landing page engine: one component renders every city+industry
            page, e.g. /folsom-hvac, /sacramento-hvac */}
        <Route path="/:combinedSlug" element={<LandingPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
