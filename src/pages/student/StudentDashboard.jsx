import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ROLE_CONFIG } from '../../constants/index'
import { bookerAPI } from '../../services/api'
import useBackLogout from '../../hooks/useBackLogout'
import '../../styles/Auth.css'

const STATUS_BADGE = {
  PENDING:   { color: '#f39c12', label: '⏳ Pending' },
  APPROVED:  { color: '#3498db', label: '✅ Approved' },
  COMPLETED: { color: '#27ae60', label: '🟢 Completed' },
  REJECTED:  { color: '#e74c3c', label: '❌ Rejected' },
}

const StudentDashboard = () => {
  const { user, logout } = useAuth()
  const roleLabel = ROLE_CONFIG[user?.userType]?.label || 'Appointments'
  useBackLogout()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [bookLoading, setBookLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  // Book form state
  const [counsellors, setCounsellors] = useState([])
  const [selectedCounsellor, setSelectedCounsellor] = useState('general')
  const [availability, setAvailability] = useState({ schedules: [], taken: [] })
  
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [description, setDescription] = useState('')
  const [advice, setAdvice] = useState(null)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await bookerAPI.getAppointments()
      setAppointments(res.data || [])
    } catch {
      setMsg({ type: 'error', text: 'Failed to load appointments.' })
    } finally {
      setLoading(false)
    }
  }

  // Load Counsellors on mount
  useEffect(() => {
    fetchAppointments()
    bookerAPI.getCounsellors().then(res => setCounsellors(res.data || [])).catch(console.error)
  }, [])

  // Load Availability when selectedCounsellor changes
  useEffect(() => {
    if (activeTab === 'appointments') {
      const cid = selectedCounsellor === 'general' ? null : selectedCounsellor;
      bookerAPI.getAvailability(cid).then(res => setAvailability(res.data || { schedules: [], taken: [] })).catch(console.error)
      setDate('')
      setTimeSlot('')
    }
  }, [selectedCounsellor, activeTab])

  // Calculate available time slots for the chosen date
  const availableSlots = useMemo(() => {
    if (!date || !availability.schedules.length) return []
    
    // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
    let dayOfWeek = new Date(date).getDay()
    // Our DB uses 1=Mon ... 7=Sun or 0=Sun? Let's assume standard JS day or match DB (where Sun=0 or 7).
    // In our seed, Mon=1, Tue=2, Wed=3, Thu=4. So it aligns with JS 1=Mon. 
    
    const daySchedules = availability.schedules.filter(s => s.day_of_week === dayOfWeek)
    let generatedSlots = new Set()

    daySchedules.forEach(schedule => {
      let [h, m] = schedule.start_time.split(':').map(Number)
      let [eh, em] = schedule.end_time.split(':').map(Number)
      
      let currentMin = h * 60 + m
      let endMin = eh * 60 + em
      
      while (currentMin + schedule.slot_duration <= endMin) {
        let slotH = Math.floor(currentMin / 60)
        let slotM = currentMin % 60
        let slotString = `${slotH.toString().padStart(2, '0')}:${slotM.toString().padStart(2, '0')}:00`
        generatedSlots.add(slotString)
        currentMin += schedule.slot_duration
      }
    })

    // Filter out taken slots
    let slotsArray = Array.from(generatedSlots)
    const takenSet = new Set(
      availability.taken
        .filter(t => t.appointment_date.startsWith(date))
        .map(t => t.time_slot)
    )
    
    return slotsArray.filter(s => !takenSet.has(s)).sort()
  }, [date, availability])

  const handleBook = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    if (!date || !timeSlot) {
      setMsg({ type: 'error', text: 'Please select date and time slot.' })
      return
    }
    setBookLoading(true)
    try {
      const payload = { 
        appointment_date: date, 
        time_slot: timeSlot, 
        description,
        requested_counsellor_id: selectedCounsellor === 'general' ? null : selectedCounsellor
      }
      await bookerAPI.bookAppointment(payload)
      setMsg({ type: 'success', text: '✅ Appointment booked successfully! A counsellor will review it.' })
      setDate(''); setTimeSlot(''); setDescription('')
      // Refresh taken slots
      const cid = selectedCounsellor === 'general' ? null : selectedCounsellor;
      bookerAPI.getAvailability(cid).then(res => setAvailability(res.data || { schedules: [], taken: [] })).catch(console.error)
      fetchAppointments()
      setTimeout(() => setActiveTab('status'), 1500)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Booking failed. Try again.' })
    } finally {
      setBookLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      await bookerAPI.cancelAppointment(id)
      setMsg({ type: 'success', text: 'Appointment cancelled.' })
      fetchAppointments()
      if (activeTab === 'appointments') {
        const cid = selectedCounsellor === 'general' ? null : selectedCounsellor;
        bookerAPI.getAvailability(cid).then(res => setAvailability(res.data || { schedules: [], taken: [] })).catch(console.error)
      }
    } catch {
      setMsg({ type: 'error', text: 'Could not cancel. Try again.' })
    }
  }

  const pending = appointments.filter(a => a.status === 'PENDING').length
  const approved = appointments.filter(a => a.status === 'APPROVED').length
  const completed = appointments.filter(a => a.status === 'COMPLETED').length
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1>{roleLabel} Dashboard</h1>
            <p>Welcome, <strong>{user?.name}</strong> &nbsp;|&nbsp; ID: {user?.id || user?.registration_number}</p>
          </div>
          <button className="btn btn-danger" onClick={logout}>🚪 Logout</button>
        </div>

        {msg.text && (
          <div className={msg.type === 'error' ? 'error-message' : 'success-message'} style={{ marginBottom:'16px' }}>
            {msg.text}
          </div>
        )}

        <div className="dashboard-tabs">
          {[['dashboard','📊 Overview'],['appointments','📅 Book Session'],['status','📋 My Appointments']].map(([tab, label]) => (
            <button key={tab} className={`dashboard-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setMsg({type:'',text:''}) }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === 'dashboard' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:'16px', marginTop:'8px' }}>
            {[
              { label:'Total Requests', value: appointments.length, color:'#3498db', icon:'📁' },
              { label:'Pending',        value: pending,             color:'#f39c12', icon:'⏳' },
              { label:'Approved',       value: approved,            color:'#2980b9', icon:'✅' },
              { label:'Completed',      value: completed,           color:'#27ae60', icon:'🟢' },
            ].map(card => (
              <div key={card.label} style={{ background:'white', borderRadius:'12px', padding:'24px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', borderTop:`4px solid ${card.color}` }}>
                <div style={{ fontSize:'2rem' }}>{card.icon}</div>
                <div style={{ fontSize:'2rem', fontWeight:'bold', color: card.color }}>{card.value}</div>
                <div style={{ color:'#666', fontSize:'0.9rem' }}>{card.label}</div>
              </div>
            ))}
            <div style={{ background:'white', borderRadius:'12px', padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', gridColumn:'1/-1' }}>
              <h3>ℹ️ How it works</h3>
              <ol style={{ marginTop:'8px', paddingLeft:'20px', lineHeight:'2' }}>
                <li>Click <strong>"Book Session"</strong> and pick a date + time slot.</li>
                <li>Your request goes to the counsellor as <strong>PENDING</strong>.</li>
                <li>Once the counsellor accepts, status changes to <strong>APPROVED</strong>.</li>
                <li>After the session, it becomes <strong>COMPLETED</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* ── Book Session ── */}
        {activeTab === 'appointments' && (
          <div style={{ background:'white', padding:'30px', borderRadius:'12px', maxWidth:'520px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2>📅 Book a Counselling Session</h2>
            <form onSubmit={handleBook} style={{ marginTop:'20px' }}>
              
              <div className="form-group">
                <label>Select Counsellor</label>
                <select value={selectedCounsellor} onChange={e => setSelectedCounsellor(e.target.value)} required>
                  <option value="general">General (Any Available Counsellor)</option>
                  {counsellors.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                  {selectedCounsellor === 'general' ? 'Your request will be visible to all active counsellors.' : 'Your request will be prioritized for this specific counsellor.'}
                </small>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Appointment Date</label>
                <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)} required />
                {date && (
                  <small style={{ color: availableSlots.length > 0 ? '#27ae60' : '#e74c3c', display: 'block', marginTop: '4px', fontWeight: 'bold' }}>
                    {availableSlots.length} slot(s) available on this date
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Time Slot</label>
                <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} required disabled={availableSlots.length === 0}>
                  <option value="">-- Select an available time --</option>
                  {availableSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Brief Description (optional)</label>
                <textarea rows="3" placeholder="Describe your concern briefly..." value={description} onChange={e => setDescription(e.target.value)} style={{ width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd' }} />
              </div>
              <button type="submit" className="btn-login" disabled={bookLoading || availableSlots.length === 0}>
                {bookLoading ? 'Booking...' : '📩 Book Appointment'}
              </button>
            </form>
          </div>
        )}

        {/* ── My Appointments ── */}
        {activeTab === 'status' && (
          <div style={{ background:'white', borderRadius:'12px', padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h2>📋 My Appointments</h2>
              <button className="btn btn-secondary" onClick={fetchAppointments} disabled={loading}>🔄 Refresh</button>
            </div>
            {loading ? (
              <p style={{ textAlign:'center', padding:'40px', color:'#888' }}>Loading...</p>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px', color:'#888' }}>
                <p style={{ fontSize:'3rem' }}>📭</p>
                <p>No appointments yet. <button className="btn btn-primary" onClick={() => setActiveTab('appointments')}>Book one now!</button></p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Counsellor</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt, i) => {
                      const badge = STATUS_BADGE[apt.status] || { color:'#999', label: apt.status }
                      return (
                        <tr key={apt.request_id}>
                          <td>{i + 1}</td>
                          <td>{new Date(apt.appointment_date).toLocaleDateString('en-IN')}</td>
                          <td>{apt.time_slot}</td>
                          <td>{apt.counsellor_name || 'General (Unassigned)'}</td>
                          <td><span style={{ background: badge.color, color:'white', padding:'4px 10px', borderRadius:'12px', fontSize:'0.82rem', fontWeight:'600' }}>{badge.label}</span></td>
                          <td>
                            {apt.status === 'PENDING' && (
                              <button className="btn btn-danger" style={{ padding:'4px 10px', fontSize:'0.82rem' }} onClick={() => handleCancel(apt.request_id)}>Cancel</button>
                            )}
                            {(apt.action_performed || apt.prescription) && (
                              <button className="btn btn-primary" style={{ padding:'4px 10px', fontSize:'0.82rem' }} onClick={() => setAdvice(apt)}>View Advice</button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {advice && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }} onClick={() => setAdvice(null)}>
            <div style={{ background:'white', borderRadius:'14px', padding:'28px', width:'460px', maxWidth:'92vw', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3 style={{ margin:0 }}>Counsellor's Advice</h3>
                <button onClick={() => setAdvice(null)} style={{ background:'none', border:'none', fontSize:'1.3rem', cursor:'pointer', color:'#888' }}>x</button>
              </div>
              <p style={{ color:'#666', fontSize:'0.88rem', margin:'6px 0 16px' }}>
                {new Date(advice.appointment_date).toLocaleDateString('en-IN')} &nbsp;|&nbsp; {advice.time_slot}
                {advice.counsellor_name ? ' | ' + advice.counsellor_name : ''}
              </p>

              <div style={{ marginBottom:'14px' }}>
                <strong>Session Notes</strong>
                <p style={{ margin:'4px 0', color:'#444', whiteSpace:'pre-wrap' }}>{advice.action_performed || 'No notes yet.'}</p>
              </div>

              <div style={{ marginBottom:'14px' }}>
                <strong>Prescription / Advice</strong>
                <p style={{ margin:'4px 0', color:'#444', whiteSpace:'pre-wrap' }}>{advice.prescription || 'None provided.'}</p>
              </div>

              {advice.resolution && (
                <div style={{ marginBottom:'8px' }}>
                  <strong>Resolution</strong>
                  <p style={{ margin:'4px 0', color:'#444' }}>{advice.resolution}</p>
                </div>
              )}

              <button className="btn btn-secondary" style={{ marginTop:'8px' }} onClick={() => setAdvice(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard
