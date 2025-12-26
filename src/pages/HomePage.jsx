import React from 'react'
import Header from '../components/layout/Header/Header'
import Footer from '../components/layout/Footer/Footer'
import HeroMediaSection from '../components/HeroMedia/HeroMediaSection'
import HeroIntroSection from '../components/HeroIntro/HeroIntroSection'
import AboutSection from '../components/About/AboutSection'
import PremiumAmenitiesSection from '../components/Amenities/PremiumAmenitiesSection'
import BedroomSection from '../components/Bedrooms/BedroomSection'
import GuestInfoSection from '../components/GuestInfo/GuestInfoSection'
import LocationSection from '../components/Location/LocationSection'
import './HomePage.css'

const HomePage = () => {
    return (
        <div className="app">
            <Header />

            <main>
                {/* Hero */}
                <HeroMediaSection />
                <HeroIntroSection />

                {/* About */}
                <AboutSection />

                {/* Amenities */}
                <PremiumAmenitiesSection />

                {/* Bedrooms */}
                <BedroomSection />

                {/* Guest info */}
                <GuestInfoSection />

                {/* Location */}
                <LocationSection />
            </main>

            <Footer />
        </div>
    )
}

export default HomePage

