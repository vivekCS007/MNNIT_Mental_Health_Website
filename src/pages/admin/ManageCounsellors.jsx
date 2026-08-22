import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import '../../styles/Auth.css'

const ManageCounsellors = () => {
  const [counsellors, setCounsellors] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeCounsellor, setActiveCounsellor] = useState(null)
  
  // Forms
  const [newCounsellor, setNewCounsellor] = useState({ name: '', email: '', identifier: '', branch: '', password: '' })
  const [newSchedule, setNewSchedule] = useState({ day_of_week: '1', start_time: '', end_time: '', slot_duration: 30, mode: 'offline' })
  const [blockSlot, setBlockSlot] = useState({ date: '', time_slot: '' })

  const fetchCounsellors = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getCounsellors()
      setCounsellors(res.data)
    } catch (err) {
      alert('Failed to fetch counsellors')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCounsellors()
  }, [])

  const handleCreateCounsellor = async (e) => {
    e.preventDefault()
    try {
      const res = await adminAPI.createCounsellor(newCounsellor)
      setCounsellors([...counsellors, res.data])
      setNewCounsellor({ name: '', email: '', identifier: '', branch: '', password: '' })
      alert('Counsellor created successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create counsellor')
    }
  }

  const loadSchedules = async (counsellor) => {
    setActiveCounsellor({ ...counsellor, schedules: [] })
    try {
      const res = await adminAPI.getSchedules(counsellor.id)
      setActiveCounsellor({ ...counsellor, schedules: res.data })
    } catch (err) {
      alert('Failed to load schedules')
    }
  }

  const handleAddSchedule = async (e) => {
    e.preventDefault()
    if (!activeCounsellor) return
    try {
      const payload = {
        day_of_week: parseInt(newSchedule.day_of_week),
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
        slot_duration: parseInt(newSchedule.slot_duration),
        mode: newSchedule.mode
      }
      const res = await adminAPI.addSchedule(activeCounsellor.id, payload)
      setActiveCounsellor({
        ...activeCounsellor,
        schedules: [...activeCounsellor.schedules, res.data]
      })
      setNewSchedule({ day_of_week: '1', start_time: '', end_time: '', slot_duration: 30, mode: 'offline' })
    } catch (err) {
      alert('Failed to add schedule')
    }
  }

  const handleDeleteSchedule = async (scheduleId) => {
    if (!activeCounsellor) return
    try {
      await adminAPI.deleteSchedule(activeCounsellor.id, scheduleId)
      setActiveCounsellor({
        ...activeCounsellor,
        schedules: activeCounsellor.schedules.filter(s => s.id !== scheduleId)
      })
    } catch (err) {
      alert('Failed to delete schedule')
    }
  }

  const handleBlockSlot = async (e) => {
    e.preventDefault()
    if (!activeCounsellor) return
    try {
      await adminAPI.blockSlot(activeCounsellor.id, blockSlot)
      alert('Slot blocked successfully.')
      setBlockSlot({ date: '', time_slot: '' })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to block slot')
    }
  }

  const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' }

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Left Col: List & Add Counsellor */}
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>➕ Add New Counsellor</h3>
            <form onSubmit={handleCreateCounsellor} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
              <input type="text" placeholder="Name" required value={newCounsellor.name} onChange={e => setNewCounsellor({...newCounsellor, name: e.target.value})} className="form-control" />
              <input type="email" placeholder="Email" required value={newCounsellor.email} onChange={e => setNewCounsellor({...newCounsellor, email: e.target.value})} className="form-control" />
              <input type="text" placeholder="Set Password (enter counsellor dob)" required value={newCounsellor.password} onChange={e => setNewCounsellor({...newCounsellor, password: e.target.value})} className="form-control" />
              <input type="text" placeholder="Emp ID" required value={newCounsellor.identifier} onChange={e => setNewCounsellor({...newCounsellor, identifier: e.target.value})} className="form-control" />
              <input type="text" placeholder="Branch / Dept (Optional)" value={newCounsellor.branch} onChange={e => setNewCounsellor({...newCounsellor, branch: e.target.value})} className="form-control" />
              <button type="submit" className="btn btn-primary">Create</button>
            </form>
          </div>

          <div className="card">
            <h3>👥 Counsellors List</h3>
            {loading ? <p>Loading...</p> : (
              <table className="table" style={{ marginTop: '15px' }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {counsellors.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>
                        <button className="btn btn-secondary" onClick={() => loadSchedules(c)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                          Manage Schedule
                        </button>
                      </td>
                    </tr>
                  ))}
                  {counsellors.length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center' }}>No counsellors found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Col: Manage Schedule (Active Counsellor) */}
        {activeCounsellor && (
          <div>
            <div className="card" style={{ marginBottom: '20px', borderTop: '4px solid #6a11cb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>📅 Weekly Schedule for {activeCounsellor.name}</h3>
                <button className="btn btn-danger" onClick={() => setActiveCounsellor(null)} style={{ padding: '4px 8px' }}>Close</button>
              </div>
              
              {/* Existing Schedules */}
              <ul style={{ paddingLeft: '20px', marginTop: '15px' }}>
                {activeCounsellor.schedules?.map(s => (
                  <li key={s.id} style={{ marginBottom: '10px' }}>
                    <strong>{daysMap[s.day_of_week]}</strong>: {s.start_time} - {s.end_time} ({s.slot_duration}m, {s.mode})
                    <button className="btn btn-danger" onClick={() => handleDeleteSchedule(s.id)} style={{ marginLeft: '10px', padding: '2px 6px', fontSize: '0.7rem' }}>❌ Delete</button>
                  </li>
                ))}
                {activeCounsellor.schedules?.length === 0 && <li>No weekly schedules set.</li>}
              </ul>

              <hr />
              <form onSubmit={handleAddSchedule} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
                <select required value={newSchedule.day_of_week} onChange={e => setNewSchedule({...newSchedule, day_of_week: e.target.value})} className="form-control" style={{ flex: '1 1 100px' }}>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                  <option value="0">Sunday</option>
                </select>
                <input type="time" required value={newSchedule.start_time} onChange={e => setNewSchedule({...newSchedule, start_time: e.target.value})} className="form-control" style={{ flex: '1 1 100px' }} title="Start Time" />
                <input type="time" required value={newSchedule.end_time} onChange={e => setNewSchedule({...newSchedule, end_time: e.target.value})} className="form-control" style={{ flex: '1 1 100px' }} title="End Time" />
                <input type="number" required placeholder="Duration (m)" value={newSchedule.slot_duration} onChange={e => setNewSchedule({...newSchedule, slot_duration: e.target.value})} className="form-control" style={{ flex: '1 1 100px' }} />
                <select required value={newSchedule.mode} onChange={e => setNewSchedule({...newSchedule, mode: e.target.value})} className="form-control" style={{ flex: '1 1 100px' }}>
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="both">Both</option>
                </select>
                <button type="submit" className="btn btn-primary" style={{ flex: '1 1 100%' }}>Add Slot</button>
              </form>
            </div>

            <div className="card" style={{ borderTop: '4px solid #e74c3c' }}>
              <h3>🚫 Block Specific Day/Slot</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                Block a specific date and time from being booked by users. The time slot format must match EXACTLY (e.g., "10:00 - 10:30").
              </p>
              <form onSubmit={handleBlockSlot} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                <input type="date" required value={blockSlot.date} onChange={e => setBlockSlot({...blockSlot, date: e.target.value})} className="form-control" />
                <input type="text" placeholder="e.g. 10:00 - 10:30" required value={blockSlot.time_slot} onChange={e => setBlockSlot({...blockSlot, time_slot: e.target.value})} className="form-control" />
                <button type="submit" className="btn btn-danger">Block Slot</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageCounsellors
