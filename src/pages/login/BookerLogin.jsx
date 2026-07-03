import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import { ROLE_CONFIG } from '../../constants/index'
import '../../styles/Auth.css'

// The three roles that share this login.
const BOOKER_ROLES = ['student', 'faculty', 'staff']

// Dev bypass: set VITE_DEV_LOGIN=true in .env.local to skip the backend
// and log in with a fake user (useful for checking tabs before the API exists).
const DEV_LOGIN = import.meta.env.VITE_DEV_LOGIN === 'true'

const BookerLogin = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  const roleParam = searchParams.get('role')
  const initialRole = BOOKER_ROLES.includes(roleParam) ? roleParam : 'student'
  const [role, setRole] = useState(initialRole)

  const config = ROLE_CONFIG[role]

  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!userId || !password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const response = await authAPI.login(config.userType, userId.trim(), password.trim())
      if (response.success) {
        const userData = { ...response.user, userType: config.userType }
        login(userData, response.token)
        navigate(config.dashboard, { replace: true })
      } else {
        setError(response.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Dev-only: log in instantly as the selected role without the backend.
  const handleDevLogin = () => {
    const fakeUser = {
      id: 'DEV-' + role.toUpperCase(),
      name: config.label + ' (Dev)',
      email: role + '@dev.local',
      registration_number: role === 'student' ? 'DEV20250001' : undefined,
      userType: config.userType
    }
    login(fakeUser, 'dev-token-' + role)
    navigate(config.dashboard, { replace: true })
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Book Appointment</h1>
          <p>Mental Health Center - MNNIT Allahabad</p>
        </div>

        {/* Role toggle */}
        {/* <div className="booker-toggle">
          {BOOKER_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              className={'booker-toggle-btn ' + (role === r ? 'active' : '')}
              onClick={() => {
                setRole(r)
                setError('')
              }}
            >
              {ROLE_CONFIG[r].icon} {ROLE_CONFIG[r].label}
            </button>
          ))}
        </div> */}

        {error && <div className="error-message">{error}</div>}

        <div style={{ background: '#f0f4ff', border: '1px solid #c3d0f7', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', fontSize: '0.88rem', color: '#3a4a8a' }}>
          <strong>How to login:</strong><br />
          <span>User ID: {config.idLabel}</span><br />
          <span>Password: {config.passwordHint}</span>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="userId">{config.idLabel}</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={config.idPlaceholder}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password (DOB in DD-MM-YYYY)</label>
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. 15-05-2002"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Logging in...' : 'Login as ' + config.label}
          </button>
        </form>

        {DEV_LOGIN && (
          <button
            type="button"
            className="btn-login"
            style={{ marginTop: '10px', background: '#e67e22' }}
            onClick={handleDevLogin}
          >
            Dev Login as {config.label} (no backend)
          </button>
        )}

        <div className="auth-links">
          <Link to="/book-appointment">Back</Link>
          <Link to="/">Home</Link>
        </div>
      </div>
    </div>
  )
}

export default BookerLogin
