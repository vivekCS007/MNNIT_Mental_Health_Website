import { useState, useEffect, useRef } from 'react'
import { contentAPI } from '../../services/api'
import { getEventsNewestFirst } from '../../data/events' // for fallback or merge if needed

const EVENTS_PER_PAGE = 10

// Convert File → base64
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const EMPTY_FORM = { title: '', date: '', description: '', venue: '', guest: '', coverImage: null }

// ─── Cover Image Upload Field ─────────────────────────────────────────────────
const CoverImageField = ({ value, onChange }) => {
  const inputRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10 MB.'); return }
    const base64 = await fileToBase64(file)
    onChange(base64)
  }

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#555', marginBottom: 6 }}>
        Cover / Banner Image
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          width: '100%', height: value ? 180 : 100,
          borderRadius: 10, border: '2px dashed #c4aef0',
          background: value ? 'transparent' : '#f3f0fa',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden', position: 'relative',
          transition: 'height 0.2s'
        }}
        title="Click to upload cover image"
      >
        {value ? (
          <>
            <img src={value} alt="cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0,
              transition: 'opacity 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>🔄 Change Image</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#9b7fd4' }}>
            <div style={{ fontSize: '2rem', marginBottom: 4 }}>🖼️</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to upload cover image</div>
            <div style={{ fontSize: '0.75rem', color: '#b0a0d0', marginTop: 2 }}>JPG, PNG, WEBP — max 10 MB</div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          style={{ marginTop: 6, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}
        >✕ Remove Image</button>
      )}
    </div>
  )
}

// ─── Event Form ───────────────────────────────────────────────────────────────
const EventForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial ? {
    title: initial.title || '',
    date: initial.date || '',
    description: initial.description || '',
    venue: initial.venue || '',
    guest: initial.guest || '',
    coverImage: initial.image_base64 || initial.coverImage || null,
  } : EMPTY_FORM)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div style={{ background: '#f8f6fc', border: '1.5px solid #d1c4e9', borderRadius: 10, padding: 20, marginBottom: 20 }}>
      <h4 style={{ margin: '0 0 16px', color: '#5b3ba6' }}>
        {initial ? '✏️ Edit Event' : '➕ Add New Event'}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { label: 'Title *', key: 'title', placeholder: 'e.g. Wellness Workshop 2026' },
          { label: 'Date *', key: 'date', placeholder: 'e.g. Oct 5, 2026' },
          { label: 'Venue', key: 'venue', placeholder: 'e.g. MP Hall, MNNIT' },
          { label: 'Guest / Organiser', key: 'guest', placeholder: 'e.g. Dr. Dinesh Singh' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
            <input
              value={form[key]}
              onChange={set(key)}
              placeholder={placeholder}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
        ))}

        {/* Description — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#555', marginBottom: 4 }}>Description *</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={4}
            placeholder="Brief description of the event..."
            style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        {/* Cover image — full width */}
        <CoverImageField value={form.coverImage} onChange={(v) => setForm(f => ({ ...f, coverImage: v }))} />
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
        <button
          onClick={() => {
            if (!form.title.trim() || !form.date.trim() || !form.description.trim()) {
              alert('Title, Date and Description are required.')
              return
            }
            onSave(form)
          }}
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

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageEvents = () => {
  const [events, setEvents]   = useState([])
  const [mode, setMode]       = useState(null)
  const [page, setPage]       = useState(1)
  const [saved, setSaved]     = useState(false)

  const refresh = async () => {
    try {
      const res = await contentAPI.getEvents()
      if (res.success) {
        // optionally merge with static events
        const staticEvents = getEventsNewestFirst().filter(e => !res.data.some(de => de.title === e.title))
        setEvents([...res.data, ...staticEvents])
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { refresh() }, [])

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const handleAdd = async (formData) => {
    try {
      await contentAPI.addEvent({
        ...formData,
        image_base64: formData.coverImage
      })
      refresh(); flash(); setMode(null)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleEdit = async (formData) => {
    try {
      await contentAPI.updateEvent(mode.eventId, {
        ...formData,
        image_base64: formData.coverImage
      })
      refresh(); flash(); setMode(null)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"? This cannot be undone.`)) return
    try {
      if (String(id).startsWith('evt_')) {
        alert("Cannot delete static events from the codebase via the dashboard.")
        return
      }
      await contentAPI.deleteEvent(id)
      refresh(); flash()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  // Pagination
  const totalPages = Math.ceil(events.length / EVENTS_PER_PAGE)
  const paginated  = events.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE)
  const editingEvent = mode?.eventId ? events.find(e => e.id === mode.eventId) : null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#5b3ba6' }}>🎉 Events &amp; Workshops</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {saved && (
            <span style={{ background: '#27ae60', color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600 }}>
              ✓ Saved
            </span>
          )}
          <button
            onClick={() => setMode('add')}
            style={{ background: '#5b3ba6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
          >➕ Add Event</button>
        </div>
      </div>

      {mode === 'add' && (
        <EventForm onSave={handleAdd} onCancel={() => setMode(null)} />
      )}
      {mode?.eventId && editingEvent && (
        <EventForm initial={editingEvent} onSave={handleEdit} onCancel={() => setMode(null)} />
      )}

      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f0fa', borderBottom: '2px solid #e0d5f5' }}>
              {['#', 'Cover', 'Title', 'Date', 'Venue', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: '0.82rem', color: '#5b3ba6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#999' }}>No events found.</td></tr>
            ) : paginated.map((evt, i) => {
              const thumb = evt.image_base64 || evt.coverImage || evt.media?.[0]?.thumb || evt.media?.[0]?.src
              return (
                <tr key={evt.id} style={{ borderBottom: '1px solid #f0eef8' }}>
                  <td style={{ padding: '10px 12px', color: '#999', fontSize: '0.85rem' }}>{(page - 1) * EVENTS_PER_PAGE + i + 1}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ width: 64, height: 42, borderRadius: 6, overflow: 'hidden', background: '#e8e0f5', flexShrink: 0 }}>
                      {thumb && <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#333' }}>{evt.title}</div>
                    {!String(evt.id).startsWith('evt_') && (
                      <span style={{ fontSize: '0.72rem', background: '#5b3ba6', color: '#fff', borderRadius: 8, padding: '1px 7px', marginTop: 2, display: 'inline-block' }}>Admin Added</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#666', whiteSpace: 'nowrap' }}>{evt.date}</td>
                  <td style={{ padding: '10px 12px', color: '#666' }}>{evt.venue || '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => setMode({ eventId: evt.id })}
                      disabled={String(evt.id).startsWith('evt_')}
                      style={{ marginRight: 8, background: '#5b3ba6', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: String(evt.id).startsWith('evt_') ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.82rem', opacity: String(evt.id).startsWith('evt_') ? 0.5 : 1 }}
                    >✏️ Edit</button>
                    <button
                      onClick={() => handleDelete(evt.id, evt.title)}
                      disabled={String(evt.id).startsWith('evt_')}
                      style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: String(evt.id).startsWith('evt_') ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.82rem', opacity: String(evt.id).startsWith('evt_') ? 0.5 : 1 }}
                    >🗑️ Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '16px 0', borderTop: '1px solid #f0eef8' }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #d1c4e9', background: page === 1 ? '#f5f5f5' : 'white', color: page === 1 ? '#bbb' : '#5b3ba6', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 600 }}
            >← Prev</button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${p === page ? '#5b3ba6' : '#e0d5f5'}`, background: p === page ? '#5b3ba6' : 'white', color: p === page ? 'white' : '#5b3ba6', fontWeight: 600, cursor: 'pointer', minWidth: 34 }}
              >{p}</button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #d1c4e9', background: page === totalPages ? '#f5f5f5' : 'white', color: page === totalPages ? '#bbb' : '#5b3ba6', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600 }}
            >Next →</button>
          </div>
        )}
      </div>

      <p style={{ marginTop: 12, fontSize: '0.8rem', color: '#999', textAlign: 'center' }}>
        Showing {paginated.length} of {events.length} events &nbsp;·&nbsp; Page {page} of {totalPages || 1}
      </p>
    </div>
  )
}

export default ManageEvents
