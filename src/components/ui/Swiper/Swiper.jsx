import { useState, useEffect, useRef, useCallback } from 'react'
import './Swiper.css'

const Swiper = ({
  items,
  autoPlayInterval = 3000,
  showDots = true,
  showArrows = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const containerRef = useRef(null)
  const currentIndexRef = useRef(0)

  const autoPlayRef = useRef(null)
  const autoPlayPausedRef = useRef(false)

  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    currentIndexRef.current = currentIndex
    // чтобы Modal мог читать актуальный индекс
    if (containerRef.current?.swiperAPI) {
      containerRef.current.swiperAPI.currentIndex = currentIndex
    }
  }, [currentIndex])

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
    autoPlayPausedRef.current = true
  }, [])

  const startAutoPlay = useCallback(() => {
    if (autoPlayPausedRef.current || autoPlayInterval <= 0 || !items?.length) return

    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, autoPlayInterval)
  }, [autoPlayInterval, items?.length])

  const handleMouseEnter = useCallback(() => {
    // Pause auto-play when user hovers over the image
    stopAutoPlay()
  }, [stopAutoPlay])

  const handleMouseLeave = useCallback(() => {
    // Resume auto-play when user moves cursor away
    autoPlayPausedRef.current = false
    startAutoPlay()
  }, [startAutoPlay])

  useEffect(() => {
    startAutoPlay()
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
  }, [startAutoPlay])

  const goToSlide = useCallback((index) => {
    stopAutoPlay()
    setCurrentIndex(Math.max(0, Math.min(index, items.length - 1)))
  }, [items?.length, stopAutoPlay])

  const nextSlide = useCallback(() => {
    stopAutoPlay()
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }, [items?.length, stopAutoPlay])

  const prevSlide = useCallback(() => {
    stopAutoPlay()
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }, [items?.length, stopAutoPlay])

  // ВАЖНО: вернуть API для Modal.jsx
  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.swiperAPI = {
      nextSlide,
      prevSlide,
      goToSlide,
      currentIndex: currentIndexRef.current,
    }
  }, [nextSlide, prevSlide, goToSlide])

  const handleTouchStart = (e) => {
    stopAutoPlay()
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current
    const minSwipe = 50

    if (distance > minSwipe) nextSlide()
    else if (distance < -minSwipe) prevSlide()

    touchStartX.current = 0
    touchEndX.current = 0
  }

  if (!items?.length) return null

  return (
    <div
      ref={containerRef}
      className="swiper-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="swiper-wrapper">
        {items.map((item, index) => {
          const isActive = index === currentIndex
          const isNearby = Math.abs(index - currentIndex) <= 1
          
          return (
            <div
              key={index}
              className={`swiper-slide ${isActive ? 'active' : ''}`}
              style={{ transform: `translateX(${(index - currentIndex) * 100}%)` }}
            >
              <div className="swiper-slide-content">
                {item.image && (
                  <div className="swiper-slide-image">
                    <img 
                      src={item.image} 
                      alt={item.title || `Slide ${index + 1}`}
                      loading={isNearby ? "eager" : "lazy"}
                      decoding="async"
                      fetchpriority={isActive ? "high" : "low"}
                    />
                  </div>
                )}
              {(item.title || item.text) && (
                <div className="swiper-slide-text">
                  {item.title && <h3 className="swiper-slide-title">{item.title}</h3>}
                  {item.text && <p className="swiper-slide-description">{item.text}</p>}
                </div>
              )}
            </div>
          </div>
          )
        })}
      </div>

      {showArrows && (
        <>
          <button className="swiper-button swiper-button-prev" onClick={prevSlide} type="button" aria-label="Previous slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button className="swiper-button swiper-button-next" onClick={nextSlide} type="button" aria-label="Next slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {showDots && items.length > 1 && (
        <div className="swiper-dots" role="tablist" aria-label="Slide indicators">
          {items.map((_, index) => (
            <button
              key={index}
              className={`swiper-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              type="button"
              role="tab"
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Swiper
