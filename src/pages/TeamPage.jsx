import { useState, useEffect } from 'react'
import { FaEnvelope, FaPhone } from 'react-icons/fa'
import { TEAM, TEAM_SECTION_ORDER } from '../data/team'
import { contentAPI } from '../services/api'
import './TeamPage.css'

// Build initials from a name, e.g. "Dr. Alok Bajpai" -> "AB"
const getInitials = (name) => {
  const cleaned = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim()
  const parts = cleaned.split(/\s+/)
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

// Deterministic color from the name so each avatar is consistent.
const AVATAR_COLORS = ['#5b3ba6', '#8b5fbf', '#7048a8', '#9b59b6', '#6c3f9e', '#4a2d8a']
const colorFor = (name) => {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

const MemberCard = ({ member }) => (
  <div className="member-card">
    <div className="member-avatar">
      {(member.photo || member.image_base64 || member.photo_url) ? (
        <img src={member.photo || member.image_base64 || member.photo_url} alt={member.name} />
      ) : (
        <div
          className="member-avatar-initials"
          style={{ background: colorFor(member.name) }}
        >
          {getInitials(member.name)}
        </div>
      )}
    </div>

    <h3 className="member-name">{member.name}</h3>
    {member.role && <span className="member-role">{member.role}</span>}

    <div className="member-contact">
      {member.email && (
        <a href={`mailto:${member.email}`}>
          <FaEnvelope /> {member.email}
        </a>
      )}
      {member.phone && (
        <span>
          <FaPhone /> {member.phone}
        </span>
      )}
    </div>

    {member.profileUrl && (
      <a
        href={member.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="member-profile-link"
      >
        🔗 View MNNIT Profile →
      </a>
    )}

    {member.qualification && (
      <div className="member-details">
        <p>
          <strong>Qualification:</strong> {member.qualification}
        </p>
      </div>
    )}
  </div>
)

const TeamPage = () => {
  const [activeTab, setActiveTab] = useState(TEAM_SECTION_ORDER[0])
  const [members, setMembers] = useState([])

  useEffect(() => {
    contentAPI.getTeam(activeTab)
      .then(res => {
        if (res.success && res.data.length > 0) {
          setMembers(res.data)
        } else {
          setMembers(TEAM[activeTab]?.members || [])
        }
      })
      .catch(err => {
        console.error(err)
        setMembers(TEAM[activeTab]?.members || [])
      })
  }, [activeTab])

  return (
    <div className="team-page">
      <div className="team-hero">
        <span className="team-hero-eyebrow">
          Center for Mental Health &amp; Wellbeing, MNNIT Allahabad
        </span>
        <h1>Our Team</h1>
      </div>

      <div className="team-tabs">
        {TEAM_SECTION_ORDER.map((key) => (
          <button
            key={key}
            className={`team-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {TEAM[key].label}
          </button>
        ))}
      </div>

      <div className="team-content">
        <div className="team-grid">
          {members.map((m, idx) => (
            <MemberCard key={m.id || idx} member={m} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeamPage