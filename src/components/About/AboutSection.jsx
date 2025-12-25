import React from 'react'
import './AboutSection.css'

const AboutSection = () => {
    return (
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
    )
}

export default AboutSection

