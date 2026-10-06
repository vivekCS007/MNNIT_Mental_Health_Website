import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import '../styles/Auth.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await authAPI.forgotPassword(email)
      setMessage('✅ Check your Gmail inbox for a 6-digit OTP (valid for 15 minutes)! Redirecting...')
      setTimeout(() => navigate('/reset-password'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔑 Forgot Password</h1>
          <p>Enter your registered MNNIT email — an OTP will be sent to your inbox</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@mnnit.ac.in"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading || !!message}>
            {loading ? 'Sending...' : 'Send Reset OTP'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
