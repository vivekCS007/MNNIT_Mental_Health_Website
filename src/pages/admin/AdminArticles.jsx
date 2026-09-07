import { useState, useEffect } from 'react'
import { loadPending, loadApproved } from '../ArticlesPage'

const LS_PENDING_KEY  = 'articles_pending'
const LS_APPROVED_KEY = 'articles_approved'

const savePending  = (arr) => localStorage.setItem(LS_PENDING_KEY,  JSON.stringify(arr))
const saveApproved = (arr) => localStorage.setItem(LS_APPROVED_KEY, JSON.stringify(arr))

const AdminArticles = () => {
  const [pending,  setPending]  = useState([])
  const [approved, setApproved] = useState([])
  const [preview,  setPreview]  = useState(null)
  const [saved, setSaved] = useState(false)

  const refresh = () => {
    setPending(loadPending())
    setApproved(loadApproved())
  }

  useEffect(() => { refresh() }, [])

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const handleApprove = (article) => {
    const newPending  = loadPending().filter(a => a.id !== article.id)
    const newApproved = [{ ...article, status: 'approved', approvedAt: new Date().toISOString() }, ...loadApproved()]
    savePending(newPending)
    saveApproved(newApproved)
    refresh(); flash(); setPreview(null)
  }

  const handleReject = (article) => {
    if (!window.confirm(`Reject and delete "${article.title}"?`)) return
    const newPending = loadPending().filter(a => a.id !== article.id)
    savePending(newPending)
    refresh(); flash(); setPreview(null)
  }

  const handleRemoveApproved = (article) => {
    if (!window.confirm(`Remove published article "${article.title}"?`)) return
    const newApproved = loadApproved().filter(a => a.id !== article.id)
    saveApproved(newApproved)
    refresh(); flash()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#5b3ba6' }}>📝 Wellness Articles</h2>
        {saved && (
          <span style={{ background: '#27ae60', color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600 }}>
            ✓ Saved
          </span>
        )}
      </div>

      {/* ── Pending submissions ───────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '2px solid #f0eef8', display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ margin: 0, color: '#5b3ba6', fontSize: '1rem' }}>⏳ Pending Review</h3>
          <span style={{ background: pending.length ? '#f39c12' : '#ccc', color: 'white', borderRadius: 12, padding: '1px 10px', fontSize: '0.78rem', fontWeight: 700 }}>
            {pending.length}
          </span>
        </div>
        {pending.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '28px', color: '#aaa', fontSize: '0.9rem' }}>No articles awaiting review.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fdf8ff' }}>
                {['Title', 'Author', 'Submitted', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: '0.78rem', color: '#5b3ba6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map((art) => (
                <tr key={art.id} style={{ borderBottom: '1px solid #f5f0fc' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => setPreview(art)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#5b3ba6', fontWeight: 600, textAlign: 'left', fontSize: '0.9rem' }}
                    >{art.title}</button>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#555', fontSize: '0.88rem' }}>{art.author}</td>
                  <td style={{ padding: '10px 14px', color: '#888', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {new Date(art.submittedAt).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => setPreview(art)}
                      style={{ marginRight: 6, background: '#5b3ba6', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                    >👁 Preview</button>
                    <button
                      onClick={() => handleApprove(art)}
                      style={{ marginRight: 6, background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                    >✅ Approve</button>
                    <button
                      onClick={() => handleReject(art)}
                      style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                    >❌ Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Published user articles ───────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '2px solid #f0eef8', display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ margin: 0, color: '#27ae60', fontSize: '1rem' }}>✅ Published (User Submitted)</h3>
          <span style={{ background: '#27ae60', color: 'white', borderRadius: 12, padding: '1px 10px', fontSize: '0.78rem', fontWeight: 700 }}>
            {approved.length}
          </span>
        </div>
        {approved.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '28px', color: '#aaa', fontSize: '0.9rem' }}>No user-submitted articles published yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5fcf7' }}>
                {['Title', 'Author', 'Approved', 'Remove'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: h === 'Remove' ? 'center' : 'left', fontSize: '0.78rem', color: '#27ae60', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approved.map((art) => (
                <tr key={art.id} style={{ borderBottom: '1px solid #f0fcf3' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>{art.title}</td>
                  <td style={{ padding: '10px 14px', color: '#555', fontSize: '0.88rem' }}>{art.author}</td>
                  <td style={{ padding: '10px 14px', color: '#888', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {art.approvedAt ? new Date(art.approvedAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRemoveApproved(art)}
                      style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                    >🗑️ Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Preview drawer ────────────────────────────────────── */}
      {preview && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1300 }}
          onClick={() => setPreview(null)}
        >
          <div
            style={{ background: '#faf9fc', width: 540, maxWidth: '96vw', height: '100%', overflowY: 'auto', padding: 28, boxShadow: '-8px 0 32px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, color: '#2c1a4d', fontSize: '1.2rem' }}>{preview.title}</h2>
                <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.85rem' }}>
                  {preview.author} &nbsp;·&nbsp; {new Date(preview.submittedAt).toLocaleDateString('en-IN')}
                </p>
                {preview.submittedBy && (
                  <p style={{ margin: '2px 0 0', color: '#aaa', fontSize: '0.78rem' }}>by {preview.submittedBy}</p>
                )}
              </div>
              <button onClick={() => setPreview(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#888' }}>×</button>
            </div>

            <div style={{ background: '#f0edf8', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <strong style={{ fontSize: '0.78rem', color: '#5b3ba6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Summary</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#444' }}>{preview.excerpt}</p>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#444', lineHeight: 1.7 }}>
              {(Array.isArray(preview.body) ? preview.body : [preview.body]).map((para, i) => (
                <p key={i} style={{ marginBottom: 12 }}>{para}</p>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, position: 'sticky', bottom: 0, background: '#faf9fc', paddingTop: 12, paddingBottom: 8 }}>
              <button
                onClick={() => handleApprove(preview)}
                style={{ flex: 1, background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
              >✅ Approve &amp; Publish</button>
              <button
                onClick={() => handleReject(preview)}
                style={{ flex: 1, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
              >❌ Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminArticles
