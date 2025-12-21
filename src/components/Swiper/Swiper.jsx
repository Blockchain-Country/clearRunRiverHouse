import { useState, useEffect, useRef } from 'react'
import './Swiper.css'

const Swiper = ({ items, autoPlayInterval = 3000, showDots = true }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const intervalRef = useRef(null)
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    const goToSlide = (index) => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentIndex(index)
        setTimeout(() => setIsTransitioning(false), 300)
    }

    const nextSlide = () => {
        const next = (currentIndex + 1) % items.length
        goToSlide(next)
    }

    const prevSlide = () => {
        const prev = (currentIndex - 1 + items.length) % items.length
        goToSlide(prev)
    }

    // Auto-play
    useEffect(() => {
        if (autoPlayInterval > 0 && !isTransitioning) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % items.length)
            }, autoPlayInterval)

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                }
            }
        }
    }, [currentIndex, autoPlayInterval, isTransitioning, items.length])

    // Touch handlers for swipe
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return

        const distance = touchStartX.current - touchEndX.current
        const minSwipeDistance = 50

        if (distance > minSwipeDistance) {
            nextSlide()
        } else if (distance < -minSwipeDistance) {
            prevSlide()
        }

        touchStartX.current = 0
        touchEndX.current = 0
    }

    // Pause auto-play on hover
    const handleMouseEnter = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
    }

    const handleMouseLeave = () => {
        if (autoPlayInterval > 0) {
            intervalRef.current = setInterval(() => {
                nextSlide()
            }, autoPlayInterval)
        }
    }

    return (
        <div
            className="swiper-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="swiper-wrapper">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`swiper-slide ${
                            index === currentIndex ? 'active' : ''
                        }`}
                        style={{
                            transform: `translateX(${
                                (index - currentIndex) * 100
                            }%)`,
                        }}
                    >
                        <div className="swiper-slide-content">
                            {item.image && (
                                <div className="swiper-slide-image">
                                    <img src={item.image} alt={item.title} />
                                </div>
                            )}
                            <div className="swiper-slide-text">
                                {item.title && (
                                    <h3 className="swiper-slide-title">
                                        {item.title}
                                    </h3>
                                )}
                                {item.text && (
                                    <p className="swiper-slide-description">
                                        {item.text}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation buttons */}
            <button
                className="swiper-button swiper-button-prev"
                onClick={prevSlide}
                aria-label="Previous slide"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            <button
                className="swiper-button swiper-button-next"
                onClick={nextSlide}
                aria-label="Next slide"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>

            {/* Dots indicator */}
            {showDots && (
                <div className="swiper-dots">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            className={`swiper-dot ${
                                index === currentIndex ? 'active' : ''
                            }`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Swiper

