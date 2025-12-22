import GallerySection from './components/Gallery/GallerySection.jsx'
import LocationSection from './components/LocationSection/LocationSection.jsx'
import PremiumAmenties from './components/PremiumAmenities/PremiumAmenties.jsx'
import GuestInfo from './components/GuestInfo/GuestInfo.jsx'
import Footer from './components/Footer/Footer.jsx'
import Header from './components/Header/Header.jsx'
import './App.css'
import { ROOMS } from './components/rooms/RoomsObj.jsx'

const App = () => {
    return (
        <div className="app">
            <Header />

            <main>
                {/* Hero */}
                <section id="hero" className="hero">
                    <div className="hero-image-container"></div>
                    <div className="hero-inner">
                        <div className="hero-text">
                            <p className="hero-kicker">
                                Escape to nature — in style
                            </p>
                            <h1 className="hero-title">Clear Run Riverhouse</h1>
                            <p className="hero-subtitle">
                                Spacious 6-bedroom getaway with HotTub, Outdoor
                                Sauna, Game Room, Billiard Room, a private creek
                                with forest — perfect for family and friends.
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
                    </div>
                </section>

                {/* About */}
                <section id="about" className="about section">
                    <div className="section-inner">
                        <div className="section-header">
                            <h2 className="section-title">
                                Welcome to Your Pocono Hideaway
                            </h2>
                            <p className="section-subtitle">
                                Modern comfort meets forest charm — with a
                                private creek and forest in the backyard.
                            </p>
                        </div>
                        <div className="about-grid">
                            <p>
                                Designed for families and groups to slow down,
                                recharge, and enjoy nature without sacrificing
                                comfort. Start your day with coffee on the deck,
                                explore Poconos adventures, and unwind in the
                                sauna or hot tub at night.
                            </p>
                            <p>
                                The home features a fully stocked kitchen, fast
                                Wi‑Fi, a game room, kid-friendly zones, and cozy
                                indoor and outdoor spaces to gather or relax.
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
                <GallerySection
                    items={ROOMS}
                    sectionId="rooms"
                    sectionTitle="Comfortable Accommodations"
                    sectionSubtitle="Six cozy bedrooms designed for up to 14 guests — space for everyone to unwind."
                />

                {/* <GallerySection /> */}

                {/* Guest info */}
                <GuestInfo />

                {/* Location */}
                <LocationSection />
            </main>

            <Footer />
        </div>
    )
}

export default App
