import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Swiper from '../Swiper/Swiper'
import IconButton from '../Buttons/IconButton'
import './Modal.css'

const Modal = ({ 
  open, 
  title, 
  items, 
  onClose, 
  showCloseButton = true,
  autoPlayInterval = 0,
  showDots = true,
  inline = false
}) => {
  const modalRef = useRef(null)
  const swiperRef = useRef(null)
  const scrollYRef = useRef(0)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Prevent body scroll when modal is open (only if not inline)
  useEffect(() => {
    if (inline) return // Don't lock scroll for inline mode
    
    if (open) {
      scrollYRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
      
      const body = document.body
      const html = document.documentElement
      
      body.style.overflow = 'hidden'
      html.style.overflow = 'hidden'
      body.style.touchAction = 'none'
    } else {
      const body = document.body
      const html = document.documentElement
      
      body.style.overflow = ''
      html.style.overflow = ''
      body.style.touchAction = ''
      
      scrollYRef.current = 0
    }
    
    return () => {
      const body = document.body
      const html = document.documentElement
      
      body.style.overflow = ''
      html.style.overflow = ''
      body.style.touchAction = ''
      scrollYRef.current = 0
    }
  }, [open, inline])

  // Handle Escape key and focus management
  useEffect(() => {
    if (!open || !showCloseButton) return
    
    const handler = (event) => {
      if (event.key === 'Escape' && onClose) {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handler)
    
    if (modalRef.current) {
      modalRef.current.focus()
    }
    
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, showCloseButton])

  // Update current index from Swiper
  useEffect(() => {
    if (!swiperRef.current) return
    
    const swiperContainer = swiperRef.current.querySelector('.swiper-container')
    if (swiperContainer?.swiperAPI) {
      const updateIndex = () => {
        if (swiperContainer.swiperAPI.currentIndex !== undefined) {
          setCurrentIndex(swiperContainer.swiperAPI.currentIndex)
        }
      }
      const interval = setInterval(updateIndex, 100)
      return () => clearInterval(interval)
    }
  }, [open, items])

  if (!open) return null
  if (!items || items.length === 0) return null

  const handleBackdropClick = (event) => {
    if (showCloseButton && event.target === event.currentTarget && onClose) {
      onClose()
    }
  }

  const currentItem = items[currentIndex] || items[0]
  const currentText = currentItem?.text || currentItem?.description || ''

  const handlePrev = () => {
    const swiperContainer = swiperRef.current?.querySelector('.swiper-container')
    if (swiperContainer?.swiperAPI) {
      swiperContainer.swiperAPI.prevSlide()
    }
  }

  const handleNext = () => {
    const swiperContainer = swiperRef.current?.querySelector('.swiper-container')
    if (swiperContainer?.swiperAPI) {
      swiperContainer.swiperAPI.nextSlide()
    }
  }

  const handleDotClick = (index) => {
    const swiperContainer = swiperRef.current?.querySelector('.swiper-container')
    if (swiperContainer?.swiperAPI) {
      swiperContainer.swiperAPI.goToSlide(index)
    }
  }

  // Prepare items for Swiper (only images, no text in swiper)
  const swiperItems = items.map(item => ({
    image: item.image,
    title: '',
    text: ''
  }))

  const modalContent = (
    <div 
      className={`modal ${inline ? 'modal-inline' : ''}`}
      ref={modalRef}
      tabIndex={-1}
    >
      {/* Header Section - Always render to maintain fixed height */}
      <header className="modal-header">
        {title ? (
          <h3 id="modal-title" className="modal-title">{title}</h3>
        ) : (
          <div className="modal-title-placeholder"></div>
        )}
        {showCloseButton && (
          <IconButton
            icon="close"
            onClick={onClose}
            ariaLabel="Close modal"
          />
        )}
      </header>

      {/* Image Container - Fixed size with Swiper and overlay buttons */}
      <div className="modal-image-container" ref={swiperRef}>
        <Swiper 
          items={swiperItems}
          autoPlayInterval={autoPlayInterval}
          showDots={false}
          showArrows={false}
        />
        <IconButton
          icon="prev"
          onClick={handlePrev}
          className="modal-nav-button modal-nav-prev"
          ariaLabel="Previous image"
        />
        <IconButton
          icon="next"
          onClick={handleNext}
          className="modal-nav-button modal-nav-next"
          ariaLabel="Next image"
        />
      </div>

      {/* Text Block - Always render to maintain fixed height */}
      <div className="modal-text-block">
        {currentText ? (
          <p className="modal-description">{currentText}</p>
        ) : (
          <div className="modal-description-placeholder"></div>
        )}
      </div>

      {/* Dots Indicator - Always render when showDots is true to maintain fixed height */}
      {showDots && (
        <div className="modal-dots">
          {items.length > 1 ? (
            items.map((_, index) => (
              <button
                key={index}
                className={`modal-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={index === currentIndex}
                type="button"
              />
            ))
          ) : (
            <div className="modal-dots-placeholder"></div>
          )}
        </div>
      )}
    </div>
  )

  if (inline) {
    return modalContent
  }

  // Render modal backdrop at root level using Portal for proper backdrop-filter
  const backdrop = (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {modalContent}
    </div>
  )

  // Use Portal to render at document.body level for proper backdrop-filter
  return createPortal(backdrop, document.body)
}

export default Modal

