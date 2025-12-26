import React, { useMemo } from 'react'
import Modal from '../ui/Modal/Modal'
import { getAllAmenityImages } from './premiumAmenities.data'
import './PremiumAmenitiesSection.css'

const PremiumAmenitiesSection = () => {
    // Get all images from all amenities, flattened into one array
    const swiperItems = useMemo(() => {
        return getAllAmenityImages()
    }, [])

    // Fallback title for modal header (items have their own titles that will be used dynamically)
    const modalTitle = 'Premium Amenities'

    return (
        <section id="amenities" className="amenities section">
            <div className="section-inner">
                <div className="section-header">
                    <h2 className="section-title">Premium Amenities</h2>
                    <p className="section-subtitle">
                        Everything you need for a perfect Pocono getaway.
                    </p>
                </div>
                
                {/* Single Modal - Always open, inline mode */}
                <div className="amenities-modal-container">
                    <Modal
                        open={true}
                        title={modalTitle}
                        items={swiperItems}
                        onClose={() => {}} // No close handler needed (always open)
                        showCloseButton={false}
                        autoPlayInterval={4000} // Auto-play through images
                        showDots={swiperItems.length > 1}
                        inline={true}
                    />
                </div>
            </div>
        </section>
    )
}

export default PremiumAmenitiesSection
