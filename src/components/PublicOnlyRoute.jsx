import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_CONFIG } from '../constants/index'

/**
 * PublicOnlyRoute is the mirror of ProtectedRoute.
 * If a user IS already logged in, they should never see an auth page
 * (login, forgot-password, etc.) — they get redirected to their own
 * dashboard. This prevents the "logged in but stuck on the login page
 * with no navbar" state when using the browser Back button.
 */
const PublicOnlyRoute = ({ element }) => {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#5b3ba6'
        }}
      >
        <div>Loading...</div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    const params = new URLSearchParams(location.search)
    const redirectParam = params.get('redirect')
    let defaultDashboard = ROLE_CONFIG[user.userType]?.dashboard || '/'

    // If the user navigates back to /login/booker but is already logged in as a student/staff/faculty, 
    // redirect them to the booker dashboard rather than their default role dashboard (e.g. mentor dashboard)
    if (location.pathname === '/login/booker' && ['student', 'faculty', 'staff'].includes(user.userType)) {
      defaultDashboard = '/appointments/dashboard'
    }

    const dashboard = redirectParam || defaultDashboard
    return <Navigate to={dashboard} replace />
  }

  return element
}

export default PublicOnlyRoute
