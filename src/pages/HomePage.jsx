import React, { useState } from 'react'
import Header from '../components/layout/Header/Header'
import Footer from '../components/layout/Footer/Footer'
import HeroMediaSection from '../components/HeroMedia/HeroMediaSection'
import HeroIntroSection from '../components/HeroIntro/HeroIntroSection'
import AboutSection from '../components/About/AboutSection'
import PremiumAmenitiesSection from '../components/Amenities/PremiumAmenitiesSection'
import BedroomSection from '../components/Bedrooms/BedroomSection'
import GuestInfoSection from '../components/GuestInfo/GuestInfoSection'
import LocationSection from '../components/Location/LocationSection'
import BookingModal from '../components/Booking/BookingModal'
import './HomePage.css'

const HomePage = () => {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

    const openBookingModal = () => setIsBookingModalOpen(true)
    const closeBookingModal = () => setIsBookingModalOpen(false)

    return (
        <div className="app">
            <Header onCheckAvailability={openBookingModal} />

            <main>
                {/* Hero */}
                <HeroMediaSection />
                <HeroIntroSection onBookStay={openBookingModal} />

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

            <BookingModal
                open={isBookingModalOpen}
                onClose={closeBookingModal}
            />
        </div>
    )
}

export default HomePage

