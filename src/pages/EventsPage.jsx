import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEventsNewestFirst } from '../data/events'
import { contentAPI } from '../services/api'
import './EventsPage.css'

const EVENTS_PER_PAGE = 10

const EventsPage = () => {
  const [events, setEvents] = useState([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    contentAPI.getEvents().then(res => {
      if (res.success) {
        const dbEvents = res.data
        const staticEvents = getEventsNewestFirst().filter(e => !dbEvents.some(de => de.title === e.title))
        setEvents([...dbEvents, ...staticEvents])
      } else {
        setEvents(getEventsNewestFirst())
      }
    }).catch(err => {
      console.error(err)
      setEvents(getEventsNewestFirst())
    })
  }, [])

  const totalPages = Math.ceil(events.length / EVENTS_PER_PAGE)
  const paginated  = events.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE)

  return (
    <div className="events-page">
      <div className="events-board">
        <div className="events-board-header">
          <h1>Events & Workshops Notice Board</h1>
          <p>A look back at our past events and programmes</p>
        </div>

        <div className="events-timeline">
          {paginated.map((event) => (
            <Link
              to={`/event/${event.id}`}
              key={event.id}
              className="event-card"
            >
              <div className="event-card-thumb">
                <img src={event.image_base64 || event.coverImage || event.media?.[0]?.thumb || event.media?.[0]?.src} alt={event.title} />
                {event.media?.[0]?.type === 'video' && (
                  <span className="event-card-play">▶</span>
                )}
              </div>
              <div className="event-card-body">
                <span className="event-card-date">{event.date}</span>
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-desc">{event.description}</p>
                <span className="event-card-link">View details →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '28px 0 10px', flexWrap: 'wrap' }}>
            <button
              disabled={page === 1}
              onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #d1c4e9', background: page === 1 ? '#f5f5f5' : 'white', color: page === 1 ? '#bbb' : '#5b3ba6', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
            >← Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${p === page ? '#5b3ba6' : '#e0d5f5'}`, background: p === page ? '#5b3ba6' : 'white', color: p === page ? 'white' : '#5b3ba6', fontWeight: 700, cursor: 'pointer', minWidth: 38, fontSize: '0.9rem' }}
              >{p}</button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #d1c4e9', background: page === totalPages ? '#f5f5f5' : 'white', color: page === totalPages ? '#bbb' : '#5b3ba6', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
            >Next →</button>
          </div>
        )}

        {totalPages > 1 && (
          <p style={{ textAlign: 'center', color: '#999', fontSize: '0.82rem', paddingBottom: 16 }}>
            Showing {paginated.length} of {events.length} events &nbsp;·&nbsp; Page {page} of {totalPages}
          </p>
        )}
      </div>
    </div>
  )
}

export default EventsPage
