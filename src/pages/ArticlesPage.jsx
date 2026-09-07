import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaExternalLinkAlt, FaArrowRight, FaPen } from 'react-icons/fa'
import { ARTICLES } from '../data/articles'
import { useAuth } from '../context/AuthContext'
import './ArticlesPage.css'
import './SubmitArticle.css'

import { useEffect } from 'react'
import { contentAPI } from '../services/api'

// We will fetch approved articles from the DB and merge with static ARTICLES.

// ─── Submission modal ─────────────────────────────────────────────────────────
const EMPTY_FORM = { title: '', excerpt: '', body: '', category: 'Student Experience' }

const SubmitModal = ({ user, onClose, onSubmitted }) => {
  const [form, setForm] = useState({ ...EMPTY_FORM, author: user?.name || '' })
  const [done, setDone] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.body.trim()) {
      alert('Title, summary and article body are all required.')
      return
    }
    try {
      await contentAPI.submitArticle({
        title: form.title.trim(),
        author: form.author.trim() || user?.name || 'Anonymous',
        date: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        excerpt: form.excerpt.trim(),
        color: '5b3ba6',
        body: form.body.trim().split('\n\n').filter(Boolean)
      })
      setDone(true)
      onSubmitted?.()
    } catch (err) {
      alert('Failed to submit article: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="article-modal-overlay" onClick={onClose}>
      <div className="article-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
            <h2 style={{ color: '#27ae60' }}>Article Submitted!</h2>
            <p style={{ color: '#666', fontSize: '14px', maxWidth: 380, margin: '0 auto 24px' }}>
              Your article has been sent for admin review. Once approved, it will appear on this page.
            </p>
            <button className="modal-submit-btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <h2>✍️ Write an Article</h2>
            <p className="modal-sub">Your submission will be reviewed by an admin before publishing.</p>

            <label>Title *</label>
            <input value={form.title} onChange={set('title')} placeholder="e.g. Managing Exam Stress" />

            <label>Your Name *</label>
            <input value={form.author} onChange={set('author')} placeholder="e.g. Riya Sharma, B.Tech CSE" />

            <label>Short Summary * <span style={{ fontWeight: 400, color: '#aaa' }}>(1–2 sentences shown on the card)</span></label>
            <input value={form.excerpt} onChange={set('excerpt')} placeholder="A brief description of what your article covers…" />

            <label>Article Body * <span style={{ fontWeight: 400, color: '#aaa' }}>(separate paragraphs with a blank line)</span></label>
            <textarea
              value={form.body}
              onChange={set('body')}
              rows={8}
              placeholder={"Write your article here.\n\nSeparate paragraphs with an empty line."}
            />

            <div className="modal-actions">
              <button className="modal-submit-btn" onClick={handleSubmit}>📤 Submit for Review</button>
              <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Article card ─────────────────────────────────────────────────────────────
const initials = (name) => {
  const clean = name.split(',')[0].trim()
  const parts = clean.split(/\s+/)
  const first = parts[0] ? parts[0][0] : ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

const CardBody = ({ a }) => (
  <>
    {a.image ? (
      <div className="article-card-banner article-card-banner-image">
        <img src={a.image} alt={a.title} />
      </div>
    ) : (
      <div className="article-card-banner" style={{ background: '#' + (a.color || '5b3ba6') }}>
        <span className="article-card-initials">{initials(a.author)}</span>
      </div>
    )}
    <div className="article-card-content">
      <span className="article-card-tag">
        {a.type === 'external' ? 'External' : 'Student Article'}
      </span>
      <h3 className="article-card-title">{a.title}</h3>
      <p className="article-card-author">
        {a.author}{a.date ? ' - ' + a.date : ''}
      </p>
      <p className="article-card-excerpt">{a.excerpt}</p>
      <span className="article-card-cta">
        {a.type === 'external'
          ? <> Read on site <FaExternalLinkAlt /> </>
          : <> Read article <FaArrowRight /> </>
        }
      </span>
    </div>
  </>
)

// ─── Main page ────────────────────────────────────────────────────────────────
const ArticlesPage = () => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const [showModal, setShowModal] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [dbArticles, setDbArticles] = useState([])

  useEffect(() => {
    contentAPI.getArticles('approved')
      .then(res => { if (res.success) setDbArticles(res.data) })
      .catch(err => console.error(err))
  }, [])

  const articles = [...dbArticles, ...ARTICLES]

  return (
    <div className="articles-page">
      <section className="articles-hero">
        <span className="articles-eyebrow">
          Mental Health &amp; Wellbeing Center, MNNIT Allahabad
        </span>
        <h1>Wellness Articles</h1>
        <p className="articles-subtitle">
          Reflections and resources on wellbeing — some written by our own students.
        </p>
      </section>

      {/* Submit banner */}
      <div className="submit-article-bar">
        <div className="submit-article-banner">
          <div>
            <strong>Share your experience</strong>
            <p>Write an article on mental health or wellbeing — it will be reviewed and published here.</p>
          </div>
          {isAuthenticated ? (
            <button className="submit-article-btn" onClick={() => setShowModal(true)}>
              <FaPen style={{ marginRight: 6 }} /> Write an Article
            </button>
          ) : (
            <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`} className="submit-article-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              <FaPen style={{ marginRight: 6 }} /> Log in to Write
            </Link>
          )}
        </div>
        {submitted && (
          <div className="article-pending-notice" style={{ marginTop: 12 }}>
            ⏳ Your article has been submitted and is awaiting admin approval before it appears here.
          </div>
        )}
      </div>

      <div className="articles-container">
        <div className="articles-grid">
          {articles.map((a) =>
            a.type === 'external' ? (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="article-card"
              >
                <CardBody a={a} />
              </a>
            ) : (
              <Link
                key={a.id}
                to={'/wellness-articles/' + a.id}
                className="article-card"
              >
                <CardBody a={a} />
              </Link>
            )
          )}
        </div>
      </div>

      {showModal && (
        <SubmitModal
          user={user}
          onClose={() => setShowModal(false)}
          onSubmitted={() => { setSubmitted(true); setShowModal(false) }}
        />
      )}
    </div>
  )
}

export default ArticlesPage
