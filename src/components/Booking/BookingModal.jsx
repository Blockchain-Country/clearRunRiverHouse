import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import IconButton from '../ui/Buttons/IconButton'
import './BookingModal.css'

const BookingModal = ({ open, onClose }) => {
  const modalRef = useRef(null)
  const widgetRef = useRef(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
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
    }
    
    return () => {
      const body = document.body
      const html = document.documentElement
      
      body.style.overflow = ''
      html.style.overflow = ''
      body.style.touchAction = ''
    }
  }, [open])

  // Handle Escape key and focus management
  useEffect(() => {
    if (!open) return
    
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
  }, [open, onClose])


  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && onClose) {
      onClose()
    }
  }

  if (!open) return null

  const modalContent = (
    <div 
      className="booking-modal"
      ref={modalRef}
      tabIndex={-1}
    >
      <header className="booking-modal-header">
        <h3 id="booking-modal-title" className="booking-modal-title">Book Your Stay</h3>
        <IconButton
          icon="close"
          onClick={onClose}
          ariaLabel="Close booking modal"
        />
      </header>

      <div className="booking-modal-content" ref={widgetRef}>
        <iframe
          src="https://app.ownerrez.com/widgets/4358a4dfa98a4c76b8dddbf1321cf487?view=form&propertyKey=d7a7ec3da8504c20a3eddd9b279455d9"
          title="Book Your Stay - OwnerRez Calendar"
          className="ownerrez-widget-iframe"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  )

  // Render modal backdrop at root level using Portal
  const backdrop = (
    <div 
      className="booking-modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      {modalContent}
    </div>
  )

  // Use Portal to render at document.body level
  return createPortal(backdrop, document.body)
}

export default BookingModal

