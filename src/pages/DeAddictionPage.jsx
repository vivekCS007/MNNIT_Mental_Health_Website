import { Link } from 'react-router-dom'
import './DeAddictionPage.css'

const FACILITIES = [
  { name: 'Screening', desc: 'Initial assessment to identify the presence and severity of substance use.' },
  { name: 'Assessment', desc: 'Comprehensive medical and psychological evaluation for tailored care.' },
  { name: 'Intervention', desc: 'Guided support to help individuals acknowledge their addiction and seek help.' },
  { name: 'Therapy', desc: 'Individual and group counseling to address root causes and behaviors.' },
  { name: 'Medication', desc: 'Prescribed medical treatments to manage withdrawal and cravings.' },
  { name: 'Information', desc: 'Educational resources on addiction, its effects, and the recovery process.' },
  { name: 'Support', desc: 'Ongoing emotional and practical assistance for sustained sobriety.' }
]

const DeAddictionPage = () => {
  return (
    <div className="deaddict-page">
      <section className="deaddict-hero">
        <span className="deaddict-eyebrow">
          Mental Health &amp; Wellbeing Center, MNNIT Allahabad
        </span>
        <h1>De-addiction Clinic</h1>
      </section>

      <div className="deaddict-container">
        <div className="deaddict-card">
          <div className="deaddict-info">
            <div className="deaddict-block">
              <span className="deaddict-label">When</span>
              <div className="deaddict-value">Monday to Friday</div>
              <div className="deaddict-sub">9:00 AM - 5:30 PM</div>
            </div>

            <div className="deaddict-block">
              <span className="deaddict-label">Where</span>
              <div className="deaddict-value">Health Centre</div>
              <div className="deaddict-sub">MNNIT Allahabad</div>
            </div>

            <div className="deaddict-block">
              <span className="deaddict-label">With</span>
              <div className="deaddict-value">
                <Link to="/team#counsellors" style={{ color: 'inherit', textDecoration: 'underline' }}>Experts</Link>
              </div>
            </div>

            <div className="deaddict-badge">
              <strong>Strictly Confidential</strong>
              <span>All cases and interactions are kept private.</span>
            </div>
          </div>

          <div className="deaddict-features">
            <div className="deaddict-motivation">
              <h2>
                Yes, You Can
                <br />
                Come Out of Addiction
                <br />
                <span>If You Decide</span>
              </h2>
            </div>

            <span className="deaddict-label deaddict-facilities-title">
              Facilities Available
            </span>
            <ul className="deaddict-feature-list">
              {FACILITIES.map((f) => (
                <li 
                  className="deaddict-feature-item" 
                  key={f.name}
                  data-tooltip={f.desc}
                >
                  {f.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeAddictionPage