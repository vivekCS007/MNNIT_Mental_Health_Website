import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  LineChart, Line,
  BarChart, Bar, Cell,
  PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { deanAPI } from '../../services/api'
import useBackLogout from '../../hooks/useBackLogout'
import '../../styles/Auth.css'

const PERIOD_OPTIONS = [
  { value: 'week',  label: 'Weekly (last 12 weeks)'  },
  { value: 'month', label: 'Monthly (last 12 months)' },
  { value: 'year',  label: 'Yearly (last 5 years)'   },
]

const STATUS_COLORS = {
  PENDING:   '#f39c12',
  APPROVED:  '#3498db',
  COMPLETED: '#27ae60',
  REJECTED:  '#e74c3c',
}

const STATUS_BADGE = {
  PENDING:   { color:'#f39c12', label:'Pending' },
  APPROVED:  { color:'#3498db', label:'Approved' },
  COMPLETED: { color:'#27ae60', label:'Completed' },
  REJECTED:  { color:'#e74c3c', label:'Rejected' },
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

const BRANCH_COLORS = ['#5b3ba6','#8b5fbf','#3498db','#16a085','#f39c12','#e74c3c','#27ae60','#8e44ad','#d35400','#2c3e50']

const DeanDashboard = () => {
  const { user, logout } = useAuth()
  useBackLogout()

  const [stats, setStats]       = useState(null)
  const [trends, setTrends]     = useState([])
  const [byBranch, setByBranch] = useState([])
  const [byStatus, setByStatus] = useState([])
  const [period, setPeriod]     = useState('month')
  const [userTypeGraphFilter, setUserTypeGraphFilter] = useState('all')
  const [loading, setLoading]   = useState(true)
  const [loadingT, setLoadingT] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Appointments table
  const [appointments, setAppointments] = useState([])
  const [loadingA, setLoadingA] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          deanAPI.getRequestStats(),
          deanAPI.getDashboardAnalytics(userTypeGraphFilter),
        ])
        setStats(statsRes.data)
        setByBranch(analyticsRes.data?.byBranch || [])
        setByStatus(analyticsRes.data?.byStatus || [])
      } catch {}
      finally { setLoading(false) }
    }
    fetchAll()
  }, [userTypeGraphFilter])

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoadingA(true)
    try {
      const res = await deanAPI.getAllAppointments()
      setAppointments(res.data || [])
    } catch {}
    finally { setLoadingA(false) }
  }

  const fetchTrends = useCallback(async () => {
    setLoadingT(true)
    try {
      const res = await deanAPI.getTrends(period)
      setTrends((res.data || []).map(d => ({ ...d, count: parseInt(d.count) })))
    } catch {}
    finally { setLoadingT(false) }
  }, [period])

  useEffect(() => { fetchTrends() }, [fetchTrends])

  const completionRate = stats && stats.totalRequests > 0
    ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
    : 0

  const branchData = useMemo(() => {
    const map = {}
    byBranch.forEach(b => {
      const name = b.branch || 'Unspecified'
      if (!map[name]) map[name] = { name, student: 0, faculty: 0, staff: 0 }
      const t = b.booker_type
      if (t === 'student' || t === 'faculty' || t === 'staff') {
        map[name][t] += parseInt(b.count)
      }
    })
    // sort by total desc
    return Object.values(map).sort((a, b) =>
      (b.student + b.faculty + b.staff) - (a.student + a.faculty + a.staff)
    )
  }, [byBranch])
  const statusData = useMemo(
    () => byStatus.map(s => ({ name: s.status, value: parseInt(s.count) })),
    [byStatus]
  )

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const st = a.request_status || a.status
      const matchType = typeFilter === 'all' || a.booker_type === typeFilter
      const matchStatus = !statusFilter || st === statusFilter
      const matchBranch = !branchFilter || a.branch === branchFilter
      const matchCourse = !courseFilter || a.course === courseFilter
      const matchYear = !yearFilter || a.year === yearFilter
      
      const q = search.trim().toLowerCase()
      const matchSearch = !q ||
        (a.booker_name && a.booker_name.toLowerCase().includes(q)) ||
        (a.registration_number && a.registration_number.toLowerCase().includes(q)) ||
        (a.booker_email && a.booker_email.toLowerCase().includes(q))
        
      return matchType && matchStatus && matchBranch && matchCourse && matchYear && matchSearch
    })
  }, [appointments, search, typeFilter, statusFilter, branchFilter, courseFilter, yearFilter])

  const STAT_CARDS = [
    { label:'Total Requests',    value: stats?.totalRequests     || 0, color:'#5b3ba6' },
    { label:'Pending',           value: stats?.pendingRequests   || 0, color:'#f39c12' },
    { label:'Approved',          value: stats?.approvedRequests  || 0, color:'#3498db' },
    { label:'Completed',         value: stats?.completedRequests || 0, color:'#27ae60' },
    { label:'Completion Rate',   value: completionRate + '%',          color:'#16a085' },
    { label:'Total Students',    value: stats?.totalStudents     || 0, color:'#2980b9' },
    { label:'Total Counsellors', value: stats?.totalCounsellors  || 0, color:'#8e44ad' },
  ]

  return (
    <div className="dashboard-container">
      <div className="container">

        {/* Header */}
        <div className="dashboard-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
          <div>
            <h1 style={{ margin:0 }}>Dean Dashboard</h1>
            <p style={{ margin:'4px 0 0', color:'#666' }}>Welcome, <strong>{user?.name}</strong> - Student Welfare Overview</p>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button className="btn btn-secondary" onClick={async () => {
              setExporting(true)
              try {
                const res = await deanAPI.exportData('csv')
                const rawData = res?.data ?? res
                const blob = rawData instanceof Blob ? rawData : new Blob([rawData], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', 'dean_appointments_export.csv')
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
              } catch (e) {
                alert('Failed to export data')
              }
              setExporting(false)
            }} disabled={exporting}>
              {exporting ? 'Downloading...' : '📥 Download CSV Report'}
            </button>
            <button className="btn btn-danger" onClick={logout}>Logout</button>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign:'center', padding:'60px', color:'#888', fontSize:'1.2rem' }}>Loading analytics...</p>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'14px', margin:'20px 0 28px' }}>
              {STAT_CARDS.map(c => (
                <div key={c.label} style={{ background:'white', borderRadius:'12px', padding:'20px 16px', textAlign:'center', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', borderTop:'4px solid ' + c.color }}>
                  <div style={{ fontSize:'2rem', fontWeight:'800', color:c.color, lineHeight:1 }}>{c.value}</div>
                  <div style={{ color:'#666', fontSize:'0.82rem', marginTop:'6px' }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Trends line chart */}
            <div style={{ background:'white', borderRadius:'14px', padding:'22px', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', marginBottom:'22px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px', marginBottom:'12px' }}>
                <h2 style={{ margin:0, fontSize:'1.2rem' }}>Appointment Trends</h2>
                <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding:'8px 12px', borderRadius:'8px', border:'1px solid #ddd' }}>
                  {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {loadingT ? (
                <p style={{ textAlign:'center', padding:'40px', color:'#888' }}>Loading trend...</p>
              ) : trends.length === 0 ? (
                <p style={{ textAlign:'center', padding:'40px', color:'#888' }}>No trend data for this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trends} margin={{ top:10, right:20, left:0, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="label" tick={{ fontSize:12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize:12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#5b3ba6" strokeWidth={3} dot={{ r:4 }} activeDot={{ r:6 }} name="Appointments" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Two charts side by side */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:'22px', marginBottom:'22px' }}>
              {/* By status pie */}
              <div style={{ background:'white', borderRadius:'14px', padding:'22px', boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                  <h2 style={{ margin:0, fontSize:'1.2rem' }}>By Status</h2>
                  <select value={userTypeGraphFilter} onChange={e => setUserTypeGraphFilter(e.target.value)} style={{ padding:'6px', borderRadius:'6px', border:'1px solid #ddd' }}>
                    <option value="all">All Users</option>
                    <option value="student">Students</option>
                    <option value="faculty">Faculty</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                {statusData.length === 0 ? (
                  <p style={{ textAlign:'center', padding:'40px', color:'#888' }}>No data.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={STATUS_COLORS[entry.name] || '#999'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* By branch bar */}
              <div style={{ background:'white', borderRadius:'14px', padding:'22px', boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
                <h2 style={{ margin:'0 0 12px', fontSize:'1.2rem' }}>By Branch / Department</h2>
                {branchData.length === 0 ? (
                  <p style={{ textAlign:'center', padding:'40px', color:'#888' }}>No data.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={branchData} margin={{ top:10, right:10, left:0, bottom:40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" tick={{ fontSize:11 }} angle={-25} textAnchor="end" interval={0} height={60} />
                      <YAxis allowDecimals={false} tick={{ fontSize:12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="student" stackId="a" name="Student" fill="#5b3ba6" radius={[0,0,0,0]} />
                      <Bar dataKey="faculty" stackId="a" name="Faculty" fill="#0d7a5f" radius={[0,0,0,0]} />
                      <Bar dataKey="staff" stackId="a" name="Staff" fill="#b8860b" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Appointments table (admin-style, read-only) */}
            <div style={{ background:'white', borderRadius:'14px', padding:'22px', boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px', marginBottom:'16px' }}>
                <h2 style={{ margin:0, fontSize:'1.2rem' }}>All Appointments ({filtered.length})</h2>
                <button className="btn btn-secondary" onClick={fetchAppointments} disabled={loadingA}>Refresh</button>
              </div>

              {/* filters */}
              <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'16px' }}>
                <input
                  type="text"
                  placeholder="Search by name, reg no or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ flex:1, minWidth:'220px', padding:'9px 12px', borderRadius:'8px', border:'1px solid #ddd' }}
                />
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:'8px', border:'1px solid #ddd' }}>
                  <option value="all">All Types</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:'8px', border:'1px solid #ddd' }}>
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:'8px', border:'1px solid #ddd' }}>
                  <option value="">All Branches</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics & Communication Engineering">ECE</option>
                  <option value="Computer Applications">Computer Applications</option>
                  <option value="Administration">Administration</option>
                </select>
                <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:'8px', border:'1px solid #ddd' }}>
                  <option value="">All Courses</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MCA">MCA</option>
                </select>
                <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:'8px', border:'1px solid #ddd' }}>
                  <option value="">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              {loadingA ? (
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
                        const st = apt.request_status || apt.status
                        const badge = STATUS_BADGE[st] || { color:'#999', label: st }
                        const tb = TYPE_BADGE[apt.booker_type] || { color:'#999', label: apt.booker_type || '-' }
                        return (
                          <tr key={apt.request_id}>
                            <td>{i+1}</td>
                            <td>
                              <button onClick={() => setDetails(apt)} style={{ background:'none', border:'none', padding:0, cursor:'pointer', color:'#5b3ba6', fontWeight:600, textAlign:'left' }} title="View full details">
                                {apt.booker_name}
                              </button>
                            </td>
                            <td><span style={{ background:tb.color, color:'white', padding:'2px 9px', borderRadius:'10px', fontSize:'0.72rem' }}>{tb.label}</span></td>
                            <td>{apt.registration_number || apt.booker_email}</td>
                            <td>{apt.branch || '-'}</td>
                            <td>{apt.course || '-'}</td>
                            <td>{apt.year || '-'}</td>
                            <td>{new Date(apt.appointment_date).toLocaleDateString('en-IN')}</td>
                            <td>{apt.time_slot}</td>
                            <td>{apt.counsellor_name || '-'}</td>
                            <td><span style={{ background:badge.color, color:'white', padding:'3px 10px', borderRadius:'10px', fontSize:'0.8rem', fontWeight:600 }}>{badge.label}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Details slide-over */}
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
      </div>
    </div>
  )
}

export default DeanDashboard
