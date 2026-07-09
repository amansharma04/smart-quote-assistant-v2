const FUNCTIONS_BASE = '/.netlify/functions'

async function request(path, options = {}) {
  const res = await fetch(`${FUNCTIONS_BASE}/${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    const err = new Error((data && data.error) || 'Something went wrong. Please try again.')
    err.fieldErrors = data && data.fieldErrors
    throw err
  }

  return data
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

export const api = {
  // Public
  siteConfig: () => request('site-config'),
  submitLead: (payload) => request('submit-lead', { method: 'POST', body: payload }),
  feedbackContext: (leadId, token) => request(`feedback-context?leadId=${encodeURIComponent(leadId)}&token=${encodeURIComponent(token)}`),
  submitFeedback: (payload) => request('submit-feedback', { method: 'POST', body: payload }),

  // Admin auth
  adminLogin: (password) => request('admin-login', { method: 'POST', body: { password } }),

  // Admin leads
  adminLeads: (token, query = '') => request(`admin-leads${query}`, { headers: authHeaders(token) }),
  updateLead: (token, payload) => request('update-lead-status', { method: 'POST', headers: authHeaders(token), body: payload }),
  createFeedbackToken: (token, leadId) =>
    request('create-feedback-token', { method: 'POST', headers: authHeaders(token), body: { leadId } }),
  exportLeads: (token) => request('export-leads', { headers: authHeaders(token) }),

  // Admin businesses
  listBusinesses: (token, query = '') => request(`admin-businesses${query}`, { headers: authHeaders(token) }),
  saveBusiness: (token, payload) => request('admin-businesses', { method: 'POST', headers: authHeaders(token), body: payload }),

  // Admin site settings
  getSiteConfigAdmin: (token) => request('admin-site-config', { headers: authHeaders(token) }),
  saveSiteConfig: (token, overrides) =>
    request('admin-site-config', { method: 'POST', headers: authHeaders(token), body: { overrides } }),
}
