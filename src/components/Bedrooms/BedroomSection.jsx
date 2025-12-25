import React from 'react'
import BedroomCard from './BedroomCard'
import { BEDROOMS } from './bedrooms.data'
import './BedroomSection.css'

const BedroomSection = () => {
    return (
        <section id="bedrooms" className="bedroom-section">
            <div className="section-inner">
                <div className="section-header">
                    <h2 className="section-title">Bedrooms Gallery</h2>
                    <p className="section-subtitle">
                        Six cozy bedrooms designed for up to 14 guests — space for everyone to unwind.
                    </p>
                </div>

                <div className="bedroom-grid">
                    {BEDROOMS.map((bedroom) => (
                        <BedroomCard key={bedroom.folder} bedroom={bedroom} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default BedroomSection

