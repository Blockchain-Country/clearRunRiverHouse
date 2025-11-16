import { useEffect, useState } from 'react'
import GallerySection from './components/Gallery/GallerySection.jsx'
import LocationSection from './components/LocationSection/LocationSection.jsx'
import PremiumAmenties from './components/PremiumAmenities/PremiumAmenties.jsx'
import GuestInfo from './components/GuestInfo/GuestInfo.jsx'
import Footer from './components/Footer/Footer.jsx'
import './App.css'

const App = () => {
    const [theme, setTheme] = useState('light')

    useEffect(() => {
        const stored = window.localStorage.getItem('crr-theme')
        if (stored === 'light' || stored === 'dark') {
            setTheme(stored)
            document.documentElement.dataset.theme = stored
            return
        }
        const prefersDark =
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
        const next = prefersDark ? 'dark' : 'light'
        setTheme(next)
        document.documentElement.dataset.theme = next
    }, [])

    useEffect(() => {
        document.documentElement.dataset.theme = theme
        window.localStorage.setItem('crr-theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
    }

    return (
        <div className="app">
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
                        <a href="#gallery" className="nav-link">
                            Gallery
                        </a>
                        <a href="#location" className="nav-link">
                            Location
                        </a>
                        <a href="#guest-info" className="nav-link">
                            Guest info
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
                        <button
                            type="button"
                            className="theme-toggle"
                            onClick={toggleTheme}
                            aria-label="Toggle color theme"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section id="hero" className="hero">
                    <div className="hero-inner">
                        <div className="hero-text">
                            <p className="hero-kicker">
                                Your forest retreat awaits
                            </p>
                            <h1 className="hero-title">Clear Run Riverhouse</h1>
                            <p className="hero-subtitle">
                                Modern 6-bedroom home on a private creek in
                                Tobyhanna, PA. Hot tub, sauna, game room and a
                                cozy fireplace for unforgettable stays.
                            </p>
                            <div className="hero-actions">
                                <a
                                    href="https://airbnb.com/h/clearrunriverhouse"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="button"
                                >
                                    Book your stay
                                </a>
                                <a
                                    href="#rooms"
                                    className="button button-ghost"
                                >
                                    View rooms
                                </a>
                            </div>
                            <dl className="hero-stats">
                                <div>
                                    <dt>Sleeps</dt>
                                    <dd>14 guests</dd>
                                </div>
                                <div>
                                    <dt>Bedrooms</dt>
                                    <dd>6 rooms</dd>
                                </div>
                                <div>
                                    <dt>Location</dt>
                                    <dd>Tobyhanna, PA</dd>
                                </div>
                            </dl>
                        </div>
                        <div className="hero-image-placeholder">
                            {/* Replace with a real hero photo via CSS background-image if you like */}
                        </div>
                    </div>
                </section>

                {/* About */}
                <section id="about" className="about section">
                    <div className="section-inner">
                        <div className="section-header">
                            <h2 className="section-title">
                                Welcome to Clear Run River House
                            </h2>
                            <p className="section-subtitle">
                                A spacious, modern home surrounded by forest and
                                a private creek.
                            </p>
                        </div>
                        <div className="about-grid">
                            <p>
                                Clear Run Riverhouse is designed for families
                                and groups who want to slow down, reconnect and
                                enjoy nature without sacrificing comfort. Start
                                your mornings with coffee on the deck, spend the
                                day exploring Poconos attractions, and finish
                                with a soak in the hot tub or a sauna session.
                            </p>
                            <p>
                                The house features a fully equipped kitchen,
                                high-speed Wi‑Fi, a dedicated game room,
                                kids-friendly spaces and multiple lounge areas
                                to spread out and relax.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Amenities */}
                <section id="amenities" className="amenities section">
                    <div className="section-inner">
                        <div className="section-header">
                            <h2 className="section-title">Premium Amenities</h2>
                            <p className="section-subtitle">
                                Everything you need for a perfect Pocono
                                getaway.
                            </p>
                        </div>
                        <div className="amenities-grid">
                            <PremiumAmenties></PremiumAmenties>
                        </div>
                    </div>
                </section>

                {/* Rooms */}
                <section id="rooms" className="rooms section">
                    <div className="section-inner">
                        <div className="section-header">
                            <h2 className="section-title">
                                Comfortable Accommodations
                            </h2>
                            <p className="section-subtitle">
                                Six thoughtfully designed bedrooms for up to 14
                                guests.
                            </p>
                        </div>
                        <div className="rooms-grid">
                            <article className="room-card">
                                <h3 className="room-title">Master bedroom</h3>
                                <p className="room-text">
                                    King bed, forest views, ensuite bathroom.
                                </p>
                            </article>
                            <article className="room-card">
                                <h3 className="room-title">Guest bedroom 1</h3>
                                <p className="room-text">
                                    Queen bed, shared bathroom.
                                </p>
                            </article>
                            <article className="room-card">
                                <h3 className="room-title">Guest bedroom 2</h3>
                                <p className="room-text">
                                    Two twin beds, perfect for kids.
                                </p>
                            </article>
                            <article className="room-card">
                                <h3 className="room-title">Guest bedroom 3</h3>
                                <p className="room-text">
                                    Queen bed, quiet corner of the house.
                                </p>
                            </article>
                            <article className="room-card">
                                <h3 className="room-title">Guest bedroom 4</h3>
                                <p className="room-text">
                                    Queen bed, easy access to bathroom.
                                </p>
                            </article>
                            <article className="room-card">
                                <h3 className="room-title">Kids bunk room</h3>
                                <p className="room-text">
                                    Bunk beds and play space for the little
                                    ones.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* <GallerySection /> */}

                {/* Location */}
                <LocationSection />

                {/* Guest info */}
                <GuestInfo />
            </main>

            <Footer />
        </div>
    )
}

export default App
