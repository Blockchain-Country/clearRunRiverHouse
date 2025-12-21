import './Header.css'

const Header = () => {
    return (
        <header className="header">
            <div className="header-inner">
                <a href="#hero" className="logo">
                    <span className="logo-icon">🏡</span>
                    <span className="logo-text">Clear Run River House</span>
                </a>
                <nav className="nav">
                    <a href="#about" className="nav-link">
                        About
                    </a>
                    <a href="#amenities" className="nav-link">
                        Amenities
                    </a>
                    <a href="#rooms" className="nav-link">
                        Rooms
                    </a>
                    <a href="#guest-info" className="nav-link">
                        Guest info
                    </a>
                    <a href="#location" className="nav-link">
                        Location
                    </a>
                </nav>
                <div className="header-actions">
                    <a
                        className="button button-outline"
                        href="https://airbnb.com/h/clearrunriverhouse"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Book on Airbnb
                    </a>
                </div>
            </div>
        </header>
    )
}

export default Header
