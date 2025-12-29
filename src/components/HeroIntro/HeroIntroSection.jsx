import React from 'react'
import Button from '../ui/Buttons/Button'
import './HeroIntroSection.css'

const HeroIntroSection = ({ onBookStay }) => {
    return (
        <div className="hero-inner">
            <div className="hero-text">
                <p className="hero-kicker">
                    Escape to nature — in style
                </p>
                <h1 className="hero-title">"Clear Run" River House</h1>
                <p className="hero-subtitle">
                    Spacious 6-bedroom getaway with HotTub, Outdoor
                    Sauna, Game Room, Billiard Room, a private creek
                    with forest — perfect for family and friends.
                </p>
                <div className="hero-actions">
                    <Button
                        variant="ghost"
                        href="#bedrooms"
                    >
                        View rooms
                    </Button>
                    <Button
                        onClick={onBookStay}
                    >
                        Book your stay
                    </Button>
                    <Button
                        variant="outline"
                        href="https://t.vrbo.io/N8kGLzBMoZb"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Book on VRBO
                    </Button>
                    <Button
                        variant="outline"
                        href="https://airbnb.com/h/clearrunriverhouse"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Book on Airbnb
                    </Button>
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
    )
}

export default HeroIntroSection

