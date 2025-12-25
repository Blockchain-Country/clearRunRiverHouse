import React from 'react'
import AmenityCard from './AmenityCard'
import { PREMIUM_AMENITIES } from './premiumAmenities.data'
import './PremiumAmenitiesSection.css'

const PremiumAmenitiesSection = () => {
    return (
        <section id="amenities" className="amenities section">
            <div className="section-inner">
                <div className="section-header">
                    <h2 className="section-title">Premium Amenities</h2>
                    <p className="section-subtitle">
                        Everything you need for a perfect Pocono getaway.
                    </p>
                </div>
                <div className="amenities-grid">
                    {PREMIUM_AMENITIES.map((amenity, index) => (
                        <AmenityCard key={index} amenity={amenity} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default PremiumAmenitiesSection

