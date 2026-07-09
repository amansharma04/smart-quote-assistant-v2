import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { token } = await api.adminLogin(password)
      sessionStorage.setItem('admin_token', token)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-5">
      <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card p-8 w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-widest text-signal-teal mb-2">
          Admin Access
        </p>
        <h1 className="text-xl font-bold mb-6">Sign in</h1>
        <label className="block text-sm font-medium text-ink/70 mb-1.5">Password</label>
        <input
          type="password"
          className="input mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="text-signal-red text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-signal-teal hover:bg-signal-tealDark disabled:opacity-60 text-white font-medium rounded-card px-6 py-3 transition-colors"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
