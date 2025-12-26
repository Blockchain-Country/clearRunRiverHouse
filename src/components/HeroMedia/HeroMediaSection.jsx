import React, { useEffect } from 'react'
import heroImage from '../../../public/images/heroImage/HeroImage.JPG'
import './HeroMediaSection.css'

const HeroMediaSection = () => {
    // Set hero image as CSS variable for proper Vite asset handling
    useEffect(() => {
        document.documentElement.style.setProperty('--hero-image', `url(${heroImage})`)
    }, [])

    return (
        <section id="hero" className="hero">
            <div className="hero-image-container"></div>
        </section>
    )
}

export default HeroMediaSection

