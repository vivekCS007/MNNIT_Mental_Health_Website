import { useState, useEffect, useRef } from 'react'
import { contentAPI } from '../../services/api'
import { TEAM } from '../../data/team' // For labels and static fallbacks if needed

const EMPTY_MEMBER = {
  name: '', role: '', email: '', phone: '',
  qualification: '', expertise: '', photo: null
}

// Converts a File to a base64 data URL
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

// ─── Image Upload Field ───────────────────────────────────────────────────────
const PhotoField = ({ value, onChange }) => {
  const inputRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5 MB.'); return }
    const base64 = await fileToBase64(file)
    onChange(base64)
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#555', marginBottom: 6 }}>
        Profile Photo
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Preview */}
        <div
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: value ? 'transparent' : '#e8e0f5',
            border: '2px dashed #c4aef0',
            overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => inputRef.current?.click()}
          title="Click to upload photo"
        >
          {value
            ? <img src={value} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '1.4rem', userSelect: 'none' }}>📷</span>
          }
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{ background: '#5b3ba6', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
          >📁 {value ? 'Change Photo' : 'Upload Photo'}</button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}
            >✕ Remove</button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#999' }}>JPG, PNG, WEBP — max 5 MB</p>
    </div>
  )
}

// ─── Member Avatar ────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#5b3ba6', '#8b5fbf', '#7048a8', '#9b59b6', '#6c3f9e', '#4a2d8a']
const colorFor = (name) => {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}
const getInitials = (name) => {
  const cleaned = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim()
  const parts = cleaned.split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

// ─── sub-components ──────────────────────────────────────────────────────────
const MemberRow = ({ member, idx, onEdit, onDelete }) => (
  <tr style={{ borderBottom: '1px solid #f0eef8' }}>
    <td style={{ padding: '10px 12px', color: '#999', fontSize: '0.85rem' }}>{idx + 1}</td>
    <td style={{ padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: (member.image_base64 || member.photo_url || member.photo) ? 'transparent' : colorFor(member.name || 'X'),
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.9rem'
        }}>
          {(member.image_base64 || member.photo_url || member.photo)
            ? <img src={member.image_base64 || member.photo_url || member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : getInitials(member.name || '?')
          }
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#333' }}>{member.name}</div>
          {member.role && <div style={{ fontSize: '0.78rem', color: '#777' }}>{member.role}</div>}
        </div>
      </div>
    </td>
    <td style={{ padding: '10px 12px', color: '#555' }}>{member.phone || '—'}</td>
    <td style={{ padding: '10px 12px' }}>
      {member.email
        ? <a href={`mailto:${member.email}`} style={{ color: '#5b3ba6' }}>{member.email}</a>
        : '—'}
    </td>
    <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
      <button
        onClick={() => onEdit(idx)}
        style={{ marginRight: 8, background: '#5b3ba6', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
      >✏️ Edit</button>
      <button
        onClick={() => onDelete(idx)}
        style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
      >🗑️ Delete</button>
    </td>
  </tr>
)

const MemberForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial ? {
    ...initial,
    photo: initial.image_base64 || initial.photo_url || initial.photo || null
  } : EMPTY_MEMBER)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div style={{ background: '#f8f6fc', border: '1.5px solid #d1c4e9', borderRadius: 10, padding: 20, marginBottom: 20 }}>
      <h4 style={{ margin: '0 0 16px', color: '#5b3ba6' }}>{initial ? '✏️ Edit Member' : '➕ Add New Member'}</h4>

      {/* Photo upload */}
      <div style={{ marginBottom: 16 }}>
        <PhotoField value={form.photo} onChange={(v) => setForm(f => ({ ...f, photo: v }))} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { label: 'Full Name *', key: 'name', placeholder: 'e.g. Mr. Prem Chandra' },
          { label: 'Designation / Role', key: 'role', placeholder: 'e.g. Senior Assistant' },
          { label: 'Phone', key: 'phone', placeholder: 'e.g. 9415014474' },
          { label: 'Email', key: 'email', placeholder: 'e.g. someone@mnnit.ac.in' },
          { label: 'Qualification', key: 'qualification', placeholder: '(optional)' },
          { label: 'Expertise', key: 'expertise', placeholder: '(optional)' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
            <input
              value={form[key] || ''}
              onChange={set(key)}
              placeholder={placeholder}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
        <button
          onClick={() => { if (!form.name.trim()) { alert('Name is required.'); return } onSave(form) }}
          style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 22px', fontWeight: 700, cursor: 'pointer' }}
        >💾 Save</button>
        <button
          onClick={onCancel}
          style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}
        >Cancel</button>
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
const ManageTeamSection = ({ sectionKey }) => {
  const label = TEAM[sectionKey]?.label || sectionKey
  const [members, setMembers] = useState([])
  const [mode, setMode] = useState(null)
  const [saved, setSaved] = useState(false)

  const refresh = async () => {
    try {
      const res = await contentAPI.getTeam(sectionKey)
      if (res.success) {
        if (res.data.length === 0 && TEAM[sectionKey]?.members) {
          // Fallback to static data if DB is empty
          setMembers(TEAM[sectionKey].members)
        } else {
          setMembers(res.data)
        }
      }
    } catch (err) {
      console.error(err)
      setMembers(TEAM[sectionKey]?.members || [])
    }
  }

  useEffect(() => {
    refresh()
    setMode(null)
  }, [sectionKey])

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const handleDelete = async (idx) => {
    const member = members[idx]
    if (!window.confirm(`Delete "${member.name}"?`)) return
    
    if (!member.id) {
      alert("Cannot delete static fallback members directly. They must be removed from codebase.")
      return
    }

    try {
      await contentAPI.deleteTeamMember(member.id)
      refresh()
      flash()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleSave = async (memberData) => {
    try {
      const payload = {
        category: sectionKey,
        name: memberData.name,
        role: memberData.role,
        email: memberData.email,
        phone: memberData.phone,
        qualification: memberData.qualification,
        expertise: memberData.expertise,
        image_base64: memberData.photo
      }

      if (mode === 'add') {
        await contentAPI.addTeamMember(payload)
      } else {
        const id = members[mode.idx].id
        if (!id) {
          // If editing a static member for the first time, add it to DB instead
          await contentAPI.addTeamMember(payload)
        } else {
          await contentAPI.updateTeamMember(id, payload)
        }
      }
      refresh()
      flash()
      setMode(null)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#5b3ba6' }}>👥 {label}</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {saved && (
            <span style={{ background: '#27ae60', color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600 }}>
              ✓ Saved
            </span>
          )}
          <button
            onClick={() => setMode('add')}
            style={{ background: '#5b3ba6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
          >➕ Add Member</button>
        </div>
      </div>

      {mode && (
        <MemberForm
          initial={mode !== 'add' ? members[mode.idx] : null}
          onSave={handleSave}
          onCancel={() => setMode(null)}
        />
      )}

      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {members.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 40, color: '#999' }}>No members yet. Click "Add Member" to get started.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f0fa', borderBottom: '2px solid #e0d5f5' }}>
                {['#', 'Name & Designation', 'Phone', 'Email', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: '0.82rem', color: '#5b3ba6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, idx) => (
                <MemberRow
                  key={m.id || idx}
                  member={m}
                  idx={idx}
                  onEdit={(i) => setMode({ idx: i })}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ManageTeamSection
