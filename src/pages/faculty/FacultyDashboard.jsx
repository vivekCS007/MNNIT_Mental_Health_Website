import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../services/api'
import styles from './FacultyDashboard.module.css'

const FacultyDashboard = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/faculty/students')
      if (response.success) {
        setStudents(response.data)
      }
    } catch (err) {
      setError('Failed to fetch assigned students.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewHistory = async (student) => {
    setSelectedStudent(student)
    setLoadingHistory(true)
    try {
      const response = await apiClient.get(`/faculty/students/${student.id}/history`)
      if (response.success) {
        setHistory(response.data)
      }
    } catch (err) {
      alert('Failed to fetch student history')
    } finally {
      setLoadingHistory(false)
    }
  }

  if (loading) return <div className={styles['dashboard-loading']}>Loading Mentor Dashboard...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className={styles['dashboard-container']}>
      <header className={styles['dashboard-header']}>
        <div>
          <h1>🧑‍🏫 Mentor Dashboard</h1>
          <p>View your assigned students and their appointment statistics.</p>
        </div>
        <div>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/appointments/dashboard')}
            style={{ fontWeight: '600' }}
          >
            📅 Book an Appointment
          </button>
        </div>
      </header>

      <div className={styles['dashboard-stats']}>
        <div className={styles['stat-card']}>
          <span className={styles['stat-title']}>Total Students</span>
          <span className={styles['stat-value']}>{students.length}</span>
        </div>
        <div className={styles['stat-card']}>
          <span className={styles['stat-title']}>Total Appointments</span>
          <span className={styles['stat-value']}>
            {students.reduce((acc, curr) => acc + curr.stats.total, 0)}
          </span>
        </div>
      </div>

      <div className={styles['dashboard-content']}>
        <div className={styles['dashboard-card']}>
          <h2>Assigned Students</h2>
          {students.length === 0 ? (
            <p className={styles['no-data']}>No students assigned to you yet.</p>
          ) : (
            <div className={styles['table-responsive']}>
              <table className={styles['data-table']}>
                <thead>
                  <tr>
                    <th>Registration No.</th>
                    <th>Name</th>
                    <th>Branch</th>
                    <th>Total Appts</th>
                    <th>Completed</th>
                    <th>Pending</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>{s.registration_number}</td>
                      <td>{s.name}</td>
                      <td>{s.branch || '-'}</td>
                      <td>{s.stats.total}</td>
                      <td style={{ color: '#27ae60', fontWeight: 'bold' }}>{s.stats.completed}</td>
                      <td style={{ color: '#f39c12', fontWeight: 'bold' }}>{s.stats.pending}</td>
                      <td>
                        <button 
                          className={styles['btn-action']}
                          onClick={() => handleViewHistory(s)}
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className={styles['dashboard-card']}>
            <h2>History: {selectedStudent.name} ({selectedStudent.registration_number})</h2>
            <button className={styles['btn-secondary']} onClick={() => setSelectedStudent(null)} style={{ marginBottom: '1rem' }}>
              Close History
            </button>
            {loadingHistory ? (
              <p>Loading history...</p>
            ) : history.length === 0 ? (
              <p className={styles['no-data']}>No appointments found for this student.</p>
            ) : (
              <div className={styles['table-responsive']}>
                <table className={styles['data-table']}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Status</th>
                      <th>Resolution</th>
                      <th>Counsellor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.request_id}>
                        <td>{new Date(h.appointment_date).toLocaleDateString('en-IN')}</td>
                        <td>{h.time_slot}</td>
                        <td>
                          <span className={`${styles['status-badge']} ${styles[`status-${h.status.toLowerCase()}`]}`}>
                            {h.status}
                          </span>
                        </td>
                        <td>{h.resolution || '-'}</td>
                        <td>{h.counsellor_name || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FacultyDashboard