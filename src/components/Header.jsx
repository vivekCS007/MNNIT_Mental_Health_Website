import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaMedium,
  FaBars,
  FaTimes
} from 'react-icons/fa'
import UserMenu from './UserMenu'
import './Header.css'
import mnnitLogo from '../assets/MNNIT_logo.png'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const { user } = useAuth()

  const closeMenu = () => {
    setIsMenuOpen(false)
    setActiveDropdown(null)
  }

  const socialMedia = [
    {
      name: 'Facebook',
      icon: <FaFacebook />,
      url: 'https://www.facebook.com/',
      tooltip: 'Like us on Facebook'
    },
    {
      name: 'Instagram',
      icon: <FaInstagram />,
      url: 'https://www.instagram.com/',
      tooltip: 'Follow us on Instagram'
    },
    {
      name: 'Youtube',
      icon: <FaYoutube />,
      url: 'https://www.youtube.com/@MHWB-SH',
      tooltip: 'Subscribe us on Youtube'
    },
    {
      name: 'Medium',
      icon: <FaMedium />,
      url: 'https://medium.com/',
      tooltip: 'Follow us on Medium'
    }
  ]

  const navigationLinks = [
    { label: 'Home', href: '/', type: 'link' },
    { label: 'Events & Workshops', href: '/event', type: 'link' },
    { label: 'Team', href: '/team', type: 'link' },
    {
      label: 'Services',
      href: '#',
      type: 'noaction',
      submenu: [
        { label: 'Individual Counselling', href: '/individual-counselling', type: 'link' },
        { label: 'De-addiction Clinic', href: '/de-addiction', type: 'link' },
        // { label: 'Events & Workshops', href: '/event', type: 'link' },
        { label: 'External 24x7 Counselling by Tele MANAS', href: '/tele_manas', type: 'link' }
      ]
    },
    {
      label: 'Resources',
      href: '#resources',
      type: 'noaction',
      submenu: [
        { label: 'Academic Resources', type: 'header' },
        { label: 'Information for Students', href: 'https://www.mnnit.ac.in/', type: 'external' },
        { label: 'Wellness Programs', href: 'https://www.mnnit.ac.in/index.php/institute/466-workshop', type: 'external' },
        { label: 'Mental Health Resources', type: 'header' },
        // { label: 'Self Assessment Tools', href: '#', type: 'anchor' },
        { label: 'Wellness Articles', href: '/wellness-articles', type: 'link' },
        // { label: 'Resource Library', href: '#', type: 'anchor' },
        { label: 'FAQs', href: '/faqs', type: 'link' },
      ]
    },
    { label: 'Book Appointment', href: '/book-appointment', type: 'link' },
    {
      label: 'Reports',
      href: '#',
      type: 'noaction',
      submenu: [
        { label: 'Counsellor', href: '/login/counsellor', type: 'link' },
        { label: 'Administrator', href: '/login/administrator', type: 'link' },
        { label: 'Dean, Student Welfare', href: '/login/dean', type: 'link' }
      ]
    },
    // {
    //   label: 'Support',
    //   href: '#support',
    //   type: 'noaction',
    //   submenu: [
    //     { label: 'Peer Support', href: '/team', type: 'link' },
    //     { label: 'External 24x7 Counselling by Tele MANAS', href: '/tele_manas', type: 'link' }
    //   ]
    // },
    { label: 'Emergency', href: '/emergency', type: 'link' }
  ]

  if (user) {
    return (
      <header className="logged-in-bar">
        <div className="logged-in-bar-content">
          <div className="logged-in-bar-brand">
            <img src={mnnitLogo} alt="MNNIT" className="brand-logo" />
          </div>
          <UserMenu />
        </div>
      </header>
    )
  }

  const renderLink = (item) => {
    if (item.type === 'header') {
      return <span className="dropdown-section-header">{item.label}</span>
    } else if (item.type === 'link') {
      return (
        <Link to={item.href} onClick={closeMenu}>
          {item.label}
        </Link>
      )
    } else if (item.type === 'noaction') {
      return (
        <a href="#" onClick={(e) => e.preventDefault()}>
          {item.label}
        </a>
      )
    } else {
      return (
        <a href={item.href} onClick={() => closeMenu()}>
          {item.label}
        </a>
      )
    }
  }

  return (
    <header className="header">
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="navbar-brand">
            <img src={mnnitLogo} alt="MNNIT" className="brand-logo" />
          </div>

          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            {navigationLinks.map((link) => (
              <li
                key={link.label}
                className={`nav-item ${link.submenu ? 'has-dropdown' : ''}`}
                onMouseEnter={() =>
                  link.submenu && setActiveDropdown(link.label)
                }
                onMouseLeave={() =>
                  link.submenu && setActiveDropdown(null)
                }
              >
                {renderLink(link)}

                {link.submenu && (
                  <ul
                    className={`dropdown-menu ${
                      activeDropdown === link.label ? 'active' : ''
                    }`}
                  >
                    {link.submenu.map((item) => (
                      <li key={item.label}>{renderLink(item)}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            <li className="social-menu-mobile-divider"></li>
            <li className="social-menu-mobile-wrapper">
              <span className="social-menu-title">Follow Us</span>
              <div className="social-menu-mobile">
                {socialMedia.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-mobile"
                    onClick={closeMenu}
                    title={social.tooltip}
                  >
                    <span className="social-icon-mobile">{social.icon}</span>
                    <span className="social-text-mobile">{social.name}</span>
                  </a>
                ))}
              </div>
            </li>
          </ul>

          <div className="nav-icons">
            {socialMedia.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-desktop"
              >
                <span className="icon-emoji">{social.icon}</span>
                <span className="tooltip-text">{social.tooltip}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
