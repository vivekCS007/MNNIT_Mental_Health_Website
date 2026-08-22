import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { adminAPI } from '../../services/api'
import useBackLogout from '../../hooks/useBackLogout'
import ManageCounsellors from './ManageCounsellors'
import '../../styles/Auth.css'

const STATUS_BADGE = {
  PENDING:   { color:'#f39c12', label:'⏳ Pending' },
  APPROVED:  { color:'#3498db', label:'✅ Approved' },
  COMPLETED: { color:'#27ae60', label:'🟢 Completed' },
  REJECTED:  { color:'#e74c3c', label:'❌ Rejected' },
}

const TYPE_BADGE = {
  student: { color:'#5b3ba6', label:'Student' },
  faculty: { color:'#0d7a5f', label:'Faculty' },
  staff:   { color:'#b8860b', label:'Staff' },
}

const RESOLUTION_LABEL = {
  RESOLVED:  'Resolved',
  FOLLOW_UP: 'Follow-Up Required',
  REFERRED:  'Referred to Specialist',
}

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  useBackLogout()

  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [activeTab, setActiveTab] = useState('appointments')
  const [details, setDetails] = useState(null)

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStatistics()
      setStats(res.data)
    } catch {}
  }

  const fetchAll = async (status = '') => {
    setLoading(true)
    try {
      const res = await adminAPI.getAllRequests(status ? { status } : {})
      setAppointments(res.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) { fetchAll(filterStatus); return }
    setLoading(true)
    try {
      const res = await adminAPI.searchByRegNo(searchQuery.trim())
      setAppointments(res.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchStats(); fetchAll() }, [])

  useEffect(() => {
    if (!searchQuery) fetchAll(filterStatus)
  }, [filterStatus])

  const appointmentsByStatus = searchQuery
    ? appointments
    : filterStatus
      ? appointments.filter(a => a.request_status === filterStatus || a.status === filterStatus)
      : appointments
      
  const filtered = appointmentsByStatus.filter(a => {
    const matchType = typeFilter === 'all' || a.booker_type === typeFilter
    const matchBranch = !branchFilter || a.branch === branchFilter
    const matchCourse = !courseFilter || a.course === courseFilter
    const matchYear = !yearFilter || a.year === yearFilter
    return matchType && matchBranch && matchCourse && matchYear
  })

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1>⚙️ Administrator Dashboard</h1>
            <p>Welcome, <strong>{user?.name}</strong></p>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button className="btn btn-secondary" onClick={async () => {
              setExporting(true)
              try {
                const res = await adminAPI.exportData('csv')
                const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', 'appointments_export.csv')
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
              } catch (e) {
                alert('Failed to export data')
              }
              setExporting(false)
            }} disabled={exporting}>
              {exporting ? 'Downloading...' : '📥 Download CSV'}
            </button>
            <button className="btn btn-danger" onClick={logout}>🚪 Logout</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <button 
            className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </button>
          <button 
            className={`btn ${activeTab === 'counsellors' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('counsellors')}
          >
            Manage Counsellors
          </button>
        </div>

        {activeTab === 'appointments' ? (
          <>
            {/* Stats */}
            {stats && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'14px', marginBottom:'24px' }}>
                {[
                  { label:'Total Requests', value: stats.totalRequests,   color:'#5b3ba6', icon:'📁' },
                  { label:'Pending',        value: stats.pendingRequests,  color:'#f39c12', icon:'⏳' },
                  { label:'Completed',      value: stats.completedRequests,color:'#27ae60', icon:'🟢' },
                  { label:'Total Students', value: stats.totalStudents,    color:'#3498db', icon:'👨‍🎓' },
                  { label:'Total Faculty',  value: stats.totalFaculty,     color:'#e74c3c', icon:'👨‍🏫' },
                  { label:'Total Staff',    value: stats.totalStaff,       color:'#16a085', icon:'🧑‍💼' }
                ].map(c => (
                  <div key={c.label} style={{ background:'white', borderRadius:'10px', padding:'20px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', borderTop:`4px solid ${c.color}` }}>
                    <div style={{ fontSize:'1.6rem' }}>{c.icon}</div>
                    <div style={{ fontSize:'1.9rem', fontWeight:'bold', color:c.color }}>{c.value}</div>
                    <div style={{ color:'#666', fontSize:'0.85rem' }}>{c.label}</div>
                  </div>
                ))}
              </div>
            )}

        {/* Search + Filter bar */}
        <div style={{ background:'white', padding:'20px', borderRadius:'12px', marginBottom:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'flex-end' }}>
          <div style={{ flex:1, minWidth:'200px' }}>
            <label style={{ display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'0.9rem' }}>🔍 Search by Reg No / Email</label>
            <input
              type="text"
              placeholder="e.g. 20BCS001"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd' }}
            />
          </div>
          <div style={{ minWidth:'160px' }}>
            <label style={{ display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'0.9rem' }}>Filter by Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd' }}>
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div style={{ minWidth:'150px' }}>
            <label style={{ display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'0.9rem' }}>Filter by Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd' }}>
              <option value="all">All Types</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div style={{ minWidth:'150px' }}>
            <label style={{ display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'0.9rem' }}>Filter by Branch</label>
            <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} style={{ width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd' }}>
              <option value="">All Branches</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics & Communication Engineering">ECE</option>
              <option value="Computer Applications">Computer Applications</option>
              <option value="Administration">Administration</option>
            </select>
          </div>
          <div style={{ minWidth:'150px' }}>
            <label style={{ display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'0.9rem' }}>Filter by Course</label>
            <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} style={{ width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd' }}>
              <option value="">All Courses</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MCA">MCA</option>
            </select>
          </div>
          <div style={{ minWidth:'150px' }}>
            <label style={{ display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'0.9rem' }}>Filter by Year</label>
            <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{ width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd' }}>
              <option value="">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleSearch} style={{ padding:'8px 20px' }}>Search</button>
          <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); setFilterStatus(''); setTypeFilter('all'); setBranchFilter(''); setCourseFilter(''); setYearFilter(''); fetchAll(); fetchStats() }} style={{ padding:'8px 16px' }}>🔄 Reset</button>
        </div>

        {/* Table */}
        <div style={{ background:'white', borderRadius:'12px', padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginBottom:'16px' }}>📋 All Appointments ({filtered.length})</h2>
          {loading ? (
            <p style={{ textAlign:'center', padding:'40px', color:'#888' }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign:'center', padding:'40px', color:'#888' }}>No records found.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Reg No / Email</th>
                    <th>Branch</th>
                    <th>Course</th>
                    <th>Year</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Counsellor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((apt, i) => {
                    const status = apt.request_status || apt.status
                    const badge = STATUS_BADGE[status] || { color:'#999', label: status }
                    return (
                      <tr key={apt.request_id}>
                        <td>{i+1}</td>
                        <td>
                          <button onClick={() => setDetails(apt)} style={{ background:'none', border:'none', padding:0, cursor:'pointer', color:'#5b3ba6', fontWeight:600, textAlign:'left' }} title="View full details">
                            {apt.booker_name}
                          </button>
                        </td>
                        <td>
                          {(() => { const tb = TYPE_BADGE[apt.booker_type] || { color:'#999', label: apt.booker_type || '-' }; return (
                            <span style={{ background:tb.color, color:'white', padding:'2px 9px', borderRadius:'10px', fontSize:'0.72rem' }}>{tb.label}</span>
                          )})()}
                        </td>
                        <td>{apt.registration_number || apt.booker_email}</td>
                        <td>{apt.branch || '-'}</td>
                        <td>{apt.course || '-'}</td>
                        <td>{apt.year || '-'}</td>
                        <td>{new Date(apt.appointment_date).toLocaleDateString('en-IN')}</td>
                        <td>{apt.time_slot}</td>
                        <td>{apt.counsellor_name || '—'}</td>
                        <td><span style={{ background:badge.color, color:'white', padding:'3px 10px', borderRadius:'10px', fontSize:'0.8rem', fontWeight:'600' }}>{badge.label}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {details && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'flex-end', zIndex:1100 }} onClick={() => setDetails(null)}>
            <div style={{ background:'#faf9fc', width:'560px', maxWidth:'96vw', height:'100%', overflowY:'auto', padding:'28px', boxShadow:'-8px 0 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <h2 style={{ margin:0 }}>{details.booker_name}</h2>
                  <p style={{ margin:'4px 0', color:'#666', fontSize:'0.9rem' }}>
                    {(TYPE_BADGE[details.booker_type] || {}).label} &nbsp;|&nbsp; {details.registration_number || details.booker_email}
                    {details.branch ? ' | ' + details.branch : ''}
                  </p>
                </div>
                <button onClick={() => setDetails(null)} style={{ background:'none', border:'none', fontSize:'1.4rem', cursor:'pointer', color:'#888' }}>x</button>
              </div>

              <section style={{ background:'white', borderRadius:'10px', padding:'16px', marginTop:'18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin:'0 0 8px' }}>Issue / Reason</h4>
                <p style={{ margin:0, color:'#444', whiteSpace:'pre-wrap' }}>{details.description || 'No description provided.'}</p>
                <p style={{ margin:'10px 0 0', fontSize:'0.85rem', color:'#777' }}>
                  Requested: {new Date(details.appointment_date).toLocaleDateString('en-IN')} at {details.time_slot}
                </p>
              </section>

              <section style={{ background:'white', borderRadius:'10px', padding:'16px', marginTop:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin:'0 0 8px' }}>Status</h4>
                {(() => { const b = STATUS_BADGE[details.request_status || details.status] || { color:'#999', label: details.request_status || details.status }; return (
                  <span style={{ background:b.color, color:'white', padding:'4px 12px', borderRadius:'12px', fontSize:'0.85rem', fontWeight:600 }}>{b.label}</span>
                )})()}
                <p style={{ margin:'10px 0 0', fontSize:'0.9rem', color:'#555' }}>
                  Counsellor: <strong>{details.counsellor_name || 'Not assigned yet'}</strong>
                </p>
              </section>

              <section style={{ background:'#f1f3f5', borderRadius:'10px', padding:'16px', marginTop:'14px' }}>
                <h4 style={{ margin:'0 0 8px', textTransform:'capitalize' }}>{details.booker_type || 'User'} Details</h4>
                <p style={{ margin:'0 0 6px', fontSize:'0.9rem' }}>
                  <strong>Name:</strong> {details.booker_name} ({details.registration_number || 'N/A'})
                </p>
                <p style={{ margin:'0 0 6px', fontSize:'0.9rem' }}>
                  <strong>Email:</strong> {details.booker_email || 'N/A'}
                </p>
                {details.booker_type === 'student' && (
                  <p style={{ margin:0, fontSize:'0.9rem' }}>
                    <strong>Course & Branch:</strong> {details.course || 'N/A'} - {details.branch || 'N/A'} (Year {details.year || 'N/A'})
                  </p>
                )}
              </section>

              <section style={{ background:'white', borderRadius:'10px', padding:'16px', marginTop:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <h4 style={{ margin:'0 0 8px' }}>Counsellor's Solution</h4>
                <p style={{ margin:'0 0 8px', color:'#444', whiteSpace:'pre-wrap' }}>
                  <em>Session Notes:</em> {details.action_performed || 'Not recorded yet.'}
                </p>
                <p style={{ margin:'0 0 8px', color:'#444', whiteSpace:'pre-wrap' }}>
                  <em>Prescription / Advice:</em> {details.prescription || 'None provided.'}
                </p>
                {details.resolution && (
                  <p style={{ margin:0, color:'#444' }}>
                    <em>Resolution:</em> {RESOLUTION_LABEL[details.resolution] || details.resolution}
                  </p>
                )}
              </section>

              <button className="btn btn-secondary" style={{ marginTop:'16px' }} onClick={() => setDetails(null)}>Close</button>
            </div>
          </div>
        )}
        </>
      ) : (
        <ManageCounsellors />
      )}
      </div>
    </div>
  )
}

export default AdminDashboard
