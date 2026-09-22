function Header({ currentPage, onNavigate }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <h1 className="logo">PDF Toolkit</h1>
        <nav>
          <button
            className={currentPage === 'home' ? 'nav-link active' : 'nav-link'}
            onClick={() => onNavigate('home')}
          >
            Home
          </button>
          <button
            className={currentPage === 'about' ? 'nav-link active' : 'nav-link'}
            onClick={() => onNavigate('about')}
          >
            About
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header
