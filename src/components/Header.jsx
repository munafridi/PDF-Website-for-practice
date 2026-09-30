import { useState } from 'react'

function Header({ currentPage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'image-to-pdf', label: 'Image to PDF' },
    { id: 'merge-pdf', label: 'Merge PDF' },
    { id: 'split-pdf', label: 'Split PDF' },
    { id: 'compress-pdf', label: 'Compress PDF' },
  ]

  function handleNavClick(pageId) {
    onNavigate(pageId)
    setMobileMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <h1 className="logo" onClick={() => handleNavClick('home')}>
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF Toolkit
        </h1>

        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={currentPage === item.id ? 'nav-link active' : 'nav-link'}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className={`hamburger ${mobileMenuOpen ? 'hamburger-open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  )
}

export default Header
