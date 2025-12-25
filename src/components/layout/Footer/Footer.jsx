import React from 'react'
import './Footer.css'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div>
                    <div>
                        © {new Date().getFullYear()} "Clear Run" River House
                    </div>
                    <div>Tobyhanna, Pennsylvania, USA</div>
                </div>
                <div className="footer-links">
                    <a href="mailto:clearrunriverhouse@gmail.com">Email us</a>
                    <a
                        href="https://t.vrbo.io/N8kGLzBMoZb"
                        target="_blank"
                        rel="noreferrer"
                    >
                        VRBO listing
                    </a>
                    <a href="#hero">Back to top</a>
                </div>
            </div>
        </footer>
    )
}

export default Footer

