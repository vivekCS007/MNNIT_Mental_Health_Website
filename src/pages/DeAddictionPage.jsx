import './DeAddictionPage.css'

const FACILITIES = [
  'Screening',
  'Assessment',
  'Intervention',
  'Therapy',
  'Medication',
  'Information',
  'Support'
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
              <div className="deaddict-value">Dr. Siddharth Srivastava</div>
              {/* <div className="deaddict-sub">(Consultant)</div> */}
              <div className="deaddict-sub">Mob :  9870541346</div>
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
                <li className="deaddict-feature-item" key={f}>
                  {f}
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