import { useState, useEffect } from 'react'
import './Header.css'

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Prevent body scroll when menu is open
    // Note: This uses a simpler approach than modal to avoid conflicts
    // Modal's position:fixed approach takes precedence when modal is open
    useEffect(() => {
        if (isMenuOpen) {
            // Only set overflow if body is not already position:fixed (modal case)
            if (document.body.style.position !== 'fixed') {
                document.body.style.overflow = 'hidden'
            }
        } else {
            // Only restore if body is not position:fixed (modal case)
            if (document.body.style.position !== 'fixed') {
                document.body.style.overflow = ''
            }
        }
        // Cleanup on unmount
        return () => {
            if (document.body.style.position !== 'fixed') {
                document.body.style.overflow = ''
            }
        }
    }, [isMenuOpen])

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    return (
        <header className="header">
            <div className="header-inner">
                <a href="#hero" className="logo" onClick={closeMenu}>
                    <span className="logo-icon">🏡</span>
                    <span className="logo-text">"Clear Run" River House</span>
                </a>
                <button
                    className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
                    <a href="#about" className="nav-link" onClick={closeMenu}>
                        About
                    </a>
                    <a href="#amenities" className="nav-link" onClick={closeMenu}>
                        Amenities
                    </a>
                    <a href="#bedrooms" className="nav-link" onClick={closeMenu}>
                        Bedrooms
                    </a>
                    <a href="#guest-info" className="nav-link" onClick={closeMenu}>
                        Guest info
                    </a>
                    <a href="#location" className="nav-link" onClick={closeMenu}>
                        Location
                    </a>
                    <a
                        className="button button-outline header-book-button"
                        href="https://t.vrbo.io/N8kGLzBMoZb"
                        target="_blank"
                        rel="noreferrer"
                        onClick={closeMenu}
                    >
                        Book on VRBO
                    </a>
                </nav>
            </div>
        </header>
    )
}

export default Header

