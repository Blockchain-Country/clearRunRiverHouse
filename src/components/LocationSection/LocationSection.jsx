import './LocationSection.css'

const LocationSection = () => {
    return (
        <section id="location" className="location">
            <div className="section-inner">
                <div className="section-header">
                    <h2 className="section-title">Location</h2>
                    <p className="section-subtitle">
                        Peaceful forest road in Tobyhanna, PA — with a private
                        creek just steps from the backyard.
                    </p>
                </div>

                <div className="location-grid">
                    <div className="location-text">
                        <ul>
                            <li>Just 2 hours from NYC and Philadelphia</li>
                            <li>
                                Close to skiing, waterparks, waterfalls, and
                                hiking
                            </li>
                            <li>
                                Private access to Clear Run creek behind the
                                house
                            </li>
                            <li>
                                Exact address shared after booking for privacy
                            </li>
                            <li>
                                Backyard opens to wild forest — pure nature!
                            </li>
                        </ul>
                    </div>
                    <div className="location-map-placeholder">
                        <iframe
                            title="Map to Clear Run River House"
                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1501.8957388802726!2d-75.37561069005183!3d41.1609012145754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1763516493464!5m2!1sen!2sus"
                            width="100%"
                            height="100%"
                            style={{ border: 0, borderRadius: '1.5rem' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LocationSection
