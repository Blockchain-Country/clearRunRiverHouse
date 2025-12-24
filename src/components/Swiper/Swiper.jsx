import { useState, useEffect, useRef, useCallback } from 'react'
import './Swiper.css'

const Swiper = ({ items, autoPlayInterval = 3000, showDots = true }) => {
    // State
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)

    // Refs for DOM elements
    const containerRef = useRef(null)
    
    // Refs for state management
    const currentIndexRef = useRef(0)
    const itemsRef = useRef(items)
    const isTransitioningRef = useRef(false)
    const autoPlayIntervalRef = useRef(null)
    const autoPlayPausedByUserRef = useRef(false) // Paused by user interaction (permanent)
    const autoPlayPausedByHoverRef = useRef(false) // Paused by hover (temporary)

    // Refs for touch gestures
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    // Refs for wheel/trackpad gesture handling
    const wheelGestureRef = useRef({
        state: 'IDLE', // IDLE | ACTIVE | LOCKED
        accumulatedDelta: 0,
        direction: null, // 'left' | 'right' | null
        resetTimeout: null
    })

    // Update refs when state/props change
    useEffect(() => {
        currentIndexRef.current = currentIndex
    }, [currentIndex])

    useEffect(() => {
        itemsRef.current = items
    }, [items])

    // Start auto-play (if conditions are met)
    const startAutoPlay = useCallback(() => {
        // Clear any existing interval first
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current)
            autoPlayIntervalRef.current = null
        }

        // Start auto-play if enabled and not paused
        if (autoPlayInterval > 0 && 
            !isTransitioningRef.current && 
            !autoPlayPausedByUserRef.current && 
            !autoPlayPausedByHoverRef.current) {
            
            autoPlayIntervalRef.current = setInterval(() => {
                // Multiple checks before navigating to prevent conflicts
                if (!isTransitioningRef.current && 
                    !autoPlayPausedByUserRef.current && 
                    !autoPlayPausedByHoverRef.current &&
                    autoPlayInterval > 0) {
                    // Use functional update and set transitioning flag
                    isTransitioningRef.current = true
                    setIsTransitioning(true)
                    
                    setCurrentIndex((prev) => {
                        const nextIndex = (prev + 1) % itemsRef.current.length
                        currentIndexRef.current = nextIndex
                        return nextIndex
                    })
                    
                    // Reset transitioning after animation
                    setTimeout(() => {
                        isTransitioningRef.current = false
                        setIsTransitioning(false)
                    }, 300)
                }
            }, autoPlayInterval)
        }
    }, [autoPlayInterval])

    // Stop auto-play (user interaction)
    const stopAutoPlay = useCallback(() => {
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current)
            autoPlayIntervalRef.current = null
        }
        autoPlayPausedByUserRef.current = true
    }, [])

    // Resume auto-play (when focus leaves swiper)
    const resumeAutoPlay = useCallback(() => {
        autoPlayPausedByUserRef.current = false
        startAutoPlay()
    }, [startAutoPlay])

    // Pause auto-play temporarily (hover)
    const pauseAutoPlayOnHover = useCallback(() => {
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current)
            autoPlayIntervalRef.current = null
        }
        autoPlayPausedByHoverRef.current = true
    }, [])

    // Resume auto-play on hover leave (only if not paused by user)
    const resumeAutoPlayOnHoverLeave = useCallback(() => {
        autoPlayPausedByHoverRef.current = false
        // Only resume if not paused by user
        if (!autoPlayPausedByUserRef.current) {
            startAutoPlay()
        }
    }, [startAutoPlay])

    // Navigate to specific slide
    const goToSlide = useCallback((index) => {
        if (isTransitioningRef.current) return
        
        // Stop auto-play permanently when user manually navigates
        stopAutoPlay()
        
        const targetIndex = Math.max(0, Math.min(index, itemsRef.current.length - 1))
        
        // Don't navigate if already on target
        if (targetIndex === currentIndexRef.current) {
            return
        }
        
        isTransitioningRef.current = true
        setIsTransitioning(true)
        setCurrentIndex(targetIndex)
        currentIndexRef.current = targetIndex

        setTimeout(() => {
            isTransitioningRef.current = false
            setIsTransitioning(false)
            // Do NOT resume auto-play - user interaction stops it permanently
        }, 300)
    }, [stopAutoPlay])

    // Navigate to next slide
    const nextSlide = useCallback(() => {
        const next = (currentIndexRef.current + 1) % itemsRef.current.length
        goToSlide(next)
    }, [goToSlide])

    // Navigate to previous slide
    const prevSlide = useCallback(() => {
        const prev = (currentIndexRef.current - 1 + itemsRef.current.length) % itemsRef.current.length
        goToSlide(prev)
    }, [goToSlide])

    // Auto-play functionality - manages starting/stopping based on state
    useEffect(() => {
        // Clear any existing interval
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current)
            autoPlayIntervalRef.current = null
        }

        // Start auto-play if conditions are met
        startAutoPlay()

        return () => {
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current)
                autoPlayIntervalRef.current = null
            }
        }
    }, [autoPlayInterval, isTransitioning, startAutoPlay])

    // Touch gesture handlers
    const handleTouchStart = useCallback((e) => {
        // Stop auto-play when user starts touching
        stopAutoPlay()
        touchStartX.current = e.touches[0].clientX
    }, [stopAutoPlay])

    const handleTouchMove = useCallback((e) => {
        touchEndX.current = e.touches[0].clientX
    }, [])

    const handleTouchEnd = useCallback(() => {
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
    }, [nextSlide, prevSlide])

    // Pause auto-play on hover (temporary pause)
    const handleMouseEnter = useCallback(() => {
        pauseAutoPlayOnHover()
    }, [pauseAutoPlayOnHover])

    const handleMouseLeave = useCallback(() => {
        // Only resume if not paused by user interaction
        resumeAutoPlayOnHoverLeave()
    }, [resumeAutoPlayOnHoverLeave])

    // Handle focus/blur to resume/stop auto-play
    const handleFocus = useCallback(() => {
        // When user focuses on swiper, don't change auto-play state
        // Auto-play will be stopped when user interacts
    }, [])

    const handleBlur = useCallback(() => {
        // When user focuses away from swiper, resume auto-play
        // This happens when user scrolls page, clicks elsewhere, etc.
        resumeAutoPlay()
    }, [resumeAutoPlay])

    // Detect when swiper is out of view or user interacts outside
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let scrollTimeoutId = null
        let interactionTimeoutId = null

        // Use Intersection Observer to detect when swiper is out of view
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // If swiper is not visible (out of viewport), resume auto-play
                    if (!entry.isIntersecting && autoPlayPausedByUserRef.current) {
                        resumeAutoPlay()
                    }
                })
            },
            { threshold: 0.1 } // Trigger when less than 10% visible
        )

        observer.observe(container)

        const handleWindowScroll = () => {
            // If user scrolls the page, they've moved focus away
            // Resume auto-play after a delay if swiper is not in view
            if (autoPlayPausedByUserRef.current) {
                // Clear any existing timeout
                if (scrollTimeoutId) {
                    clearTimeout(scrollTimeoutId)
                }
                // Check if swiper is still in view after scroll
                scrollTimeoutId = setTimeout(() => {
                    if (container) {
                        const rect = container.getBoundingClientRect()
                        const isInView = rect.top < window.innerHeight && rect.bottom > 0
                        // If swiper is out of view, resume auto-play
                        if (!isInView && autoPlayPausedByUserRef.current) {
                            resumeAutoPlay()
                        }
                    }
                }, 1500) // Wait 1.5 seconds after scroll stops
            }
        }

        const handleWindowClick = (e) => {
            // If user clicks outside the swiper container, resume auto-play after delay
            if (container && !container.contains(e.target)) {
                if (autoPlayPausedByUserRef.current) {
                    // Clear any existing timeout
                    if (interactionTimeoutId) {
                        clearTimeout(interactionTimeoutId)
                    }
                    // Resume after short delay to ensure user has moved focus
                    interactionTimeoutId = setTimeout(() => {
                        if (autoPlayPausedByUserRef.current) {
                            resumeAutoPlay()
                        }
                    }, 500)
                }
            }
        }

        window.addEventListener('scroll', handleWindowScroll, { passive: true })
        document.addEventListener('click', handleWindowClick, true)

        return () => {
            observer.disconnect()
            window.removeEventListener('scroll', handleWindowScroll)
            document.removeEventListener('click', handleWindowClick, true)
            if (scrollTimeoutId) {
                clearTimeout(scrollTimeoutId)
            }
            if (interactionTimeoutId) {
                clearTimeout(interactionTimeoutId)
            }
        }
    }, [resumeAutoPlay])

    // Wheel/trackpad gesture handler - Only intercepts horizontal scrolling
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const gesture = wheelGestureRef.current
        const WHEEL_THRESHOLD = 50
        const GESTURE_RESET_DELAY = 150
        const COOLDOWN_DURATION = 400
        const HORIZONTAL_DOMINANCE_RATIO = 1.5 // deltaX must be 1.5x larger than deltaY to be considered horizontal

        const resetGesture = () => {
            if (gesture.state === 'ACTIVE' && !isTransitioningRef.current) {
                gesture.state = 'IDLE'
                gesture.accumulatedDelta = 0
                gesture.direction = null
            }
        }

        const triggerNavigation = (direction) => {
            if (isTransitioningRef.current || gesture.state === 'LOCKED') {
                return
            }

            // Lock immediately to prevent double navigation
            gesture.state = 'LOCKED'

            // Navigate
            if (direction === 'left') {
                nextSlide()
            } else if (direction === 'right') {
                prevSlide()
            }

            // Reset gesture data
            gesture.accumulatedDelta = 0
            gesture.direction = null

            // Clear any pending reset timeout
            if (gesture.resetTimeout) {
                clearTimeout(gesture.resetTimeout)
                gesture.resetTimeout = null
            }

            // Release lock after cooldown
            setTimeout(() => {
                gesture.state = 'IDLE'
            }, COOLDOWN_DURATION)
        }

        const handleWheel = (e) => {
            const deltaX = Math.abs(e.deltaX)
            const deltaY = Math.abs(e.deltaY)
            
            // Determine scroll direction with threshold
            // Only consider it horizontal if deltaX is significantly larger than deltaY
            const isHorizontalScroll = deltaX > deltaY * HORIZONTAL_DOMINANCE_RATIO && deltaX > 5
            const isVerticalScroll = deltaY > deltaX * HORIZONTAL_DOMINANCE_RATIO && deltaY > 5

            // If vertical scrolling, allow it to pass through completely
            // This ensures page/modal content can scroll vertically
            if (isVerticalScroll) {
                // Reset any active horizontal gesture since user is scrolling vertically
                if (gesture.state === 'ACTIVE') {
                    if (gesture.resetTimeout) {
                        clearTimeout(gesture.resetTimeout)
                    }
                    resetGesture()
                }
                // Don't prevent default - allow vertical scrolling to work normally
                return
            }

            // If not clearly horizontal, allow default behavior (don't interfere)
            if (!isHorizontalScroll) {
                return
            }

            // Only prevent default for clear horizontal scrolling that we'll use for navigation
            e.preventDefault()
            e.stopPropagation()

            // Ignore if locked or transitioning
            if (gesture.state === 'LOCKED' || isTransitioningRef.current) {
                return
            }

            const delta = e.deltaX
            const direction = delta > 0 ? 'left' : delta < 0 ? 'right' : null

            // Ignore if no clear direction or too small movement
            if (!direction || Math.abs(delta) < 3) {
                return
            }

            if (gesture.state === 'IDLE') {
                // Stop auto-play when user starts wheel gesture
                stopAutoPlay()
                
                // Start new gesture
                gesture.state = 'ACTIVE'
                gesture.accumulatedDelta = Math.abs(delta)
                gesture.direction = direction

                // Set timeout to reset if gesture doesn't complete
                if (gesture.resetTimeout) {
                    clearTimeout(gesture.resetTimeout)
                }
                gesture.resetTimeout = setTimeout(resetGesture, GESTURE_RESET_DELAY)
            } else if (gesture.state === 'ACTIVE') {
                if (direction === gesture.direction) {
                    // Same direction - check if we'll cross threshold
                    const currentDelta = gesture.accumulatedDelta
                    const newDelta = Math.abs(delta)
                    const willCrossThreshold = currentDelta < WHEEL_THRESHOLD && 
                                              (currentDelta + newDelta) >= WHEEL_THRESHOLD

                    // Accumulate
                    gesture.accumulatedDelta += newDelta

                    // Trigger navigation if threshold crossed
                    if (willCrossThreshold) {
                        triggerNavigation(direction)
                        return
                    }

                    // Reset timeout
                    if (gesture.resetTimeout) {
                        clearTimeout(gesture.resetTimeout)
                    }
                    gesture.resetTimeout = setTimeout(resetGesture, GESTURE_RESET_DELAY)
                } else {
                    // Direction changed - reset and start fresh
                    if (gesture.resetTimeout) {
                        clearTimeout(gesture.resetTimeout)
                    }
                    gesture.state = 'ACTIVE'
                    gesture.accumulatedDelta = Math.abs(delta)
                    gesture.direction = direction
                    gesture.resetTimeout = setTimeout(resetGesture, GESTURE_RESET_DELAY)
                }
            }
        }

        container.addEventListener('wheel', handleWheel, { passive: false })

        return () => {
            container.removeEventListener('wheel', handleWheel)
            if (gesture.resetTimeout) {
                clearTimeout(gesture.resetTimeout)
            }
            gesture.state = 'IDLE'
            gesture.accumulatedDelta = 0
            gesture.direction = null
            gesture.resetTimeout = null
        }
    }, [nextSlide, prevSlide, stopAutoPlay])

    if (!items || items.length === 0) {
        return null
    }

    return (
        <div
            ref={containerRef}
            className="swiper-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={0}
        >
            <div className="swiper-wrapper">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`swiper-slide ${index === currentIndex ? 'active' : ''}`}
                        style={{
                            transform: `translateX(${(index - currentIndex) * 100}%)`,
                        }}
                    >
                        <div className="swiper-slide-content">
                            {item.image && (
                                <div className="swiper-slide-image">
                                    <img src={item.image} alt={item.title || `Slide ${index + 1}`} />
                                </div>
                            )}
                            {(item.title || item.text) && (
                                <div className="swiper-slide-text">
                                    {item.title && (
                                        <h3 className="swiper-slide-title">{item.title}</h3>
                                    )}
                                    {item.text && (
                                        <p className="swiper-slide-description">{item.text}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation buttons */}
            <button
                className="swiper-button swiper-button-prev"
                onClick={prevSlide}
                aria-label="Previous slide"
                type="button"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            <button
                className="swiper-button swiper-button-next"
                onClick={nextSlide}
                aria-label="Next slide"
                type="button"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>

            {/* Dots indicator */}
            {showDots && items.length > 1 && (
                <div className="swiper-dots" role="tablist" aria-label="Slide indicators">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            className={`swiper-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            aria-selected={index === currentIndex}
                            type="button"
                            role="tab"
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Swiper
