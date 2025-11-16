import React from 'react';
import './LocationSection.css';

const LocationSection = () => {
  return (
    <section id="location" className="location">
      <div className="section-inner">
        <div className="section-header">
          <h2 className="section-title">Location</h2>
          <p className="section-subtitle">
            Quiet forest road in Tobyhanna, PA with Clear Run creek right behind the house.
          </p>
        </div>

        <div className="location-grid">
          <div className="location-text">
            <ul>
              <li>About 2 hours from New York City.</li>
              <li>Close to skiing, waterparks and hiking in the Poconos.</li>
              <li>Private creek access directly behind the property.</li>
              <li>
                Exact address and gate / check-in details are shared after booking for guest privacy.
              </li>
            </ul>
          </div>
          <div className="location-map-placeholder">
            {/* You can drop in a Google Maps iframe here later */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
