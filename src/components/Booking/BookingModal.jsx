import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import IconButton from '../ui/Buttons/IconButton'
import './BookingModal.css'

// Feature flag: Enable booking/inquiry widget below calendar
// Set VITE_ENABLE_BOOKING_WIDGET=true in .env file to enable
const ENABLE_BOOKING_WIDGET = false

// ============================================================================
// OWNERREZ WIDGET CUSTOMIZATION
// ============================================================================
// To customize the appearance of OwnerRez widgets, add CSS in the OwnerRez
// dashboard: Settings > Widgets > [Select Widget] > CSS section
//
// HTML Structure (for reference):
// - booking-modal-backdrop (modal backdrop)
//   - booking-modal (modal container)
//     - booking-modal-header
//     - booking-modal-content
//       - booking-modal-widgets
//         - booking-calendar-section (Calendar widget section)
//           - booking-calendar-wrapper
//             - booking-calendar-iframe (iframe containing OwnerRez calendar)
//         - booking-form-section (Booking form section, if enabled)
//           - booking-form-wrapper
//             - booking-form-iframe (iframe containing OwnerRez booking form)
//
// Note: CSS added in OwnerRez dashboard only affects content INSIDE the iframes.
// Our wrapper classes (booking-calendar-section, booking-form-section, etc.) are
// styled in BookingModal.css and cannot be modified from OwnerRez dashboard.
//
// Site Design Tokens (for matching OwnerRez widgets to site design):
// Colors:
//   --bg: #f8f6f2 (background)
//   --bg-elevated: #ffffff (elevated surfaces)
//   --text: #1a1610 (primary text)
//   --text-muted: #4a3f2f (muted text)
//   --primary: #2d5016 (primary green)
//   --accent-green: #5a8a3a (accent green)
//   --border-subtle: #d4c9b8 (subtle borders)
//   --border-medium: #b8a896 (medium borders)
//
// Common OwnerRez widget classes you can target in OwnerRez CSS:
// - .btn-default (buttons)
// - .booknow-button (book now button)
// - .property-result-list (property lists)
// - .reviews-filter-bar (filter bars)
// - Form inputs, labels, and other widget-specific elements
//
// Example OwnerRez CSS to match site design:
//   .btn-default {
//     background: linear-gradient(135deg, #4a7c2a, #5a8a3a);
//     color: #ffffff;
//     border: none;
//     border-radius: 12px;
//     font-weight: 600;
//     box-shadow: 0 2px 8px rgba(74, 124, 42, 0.3);
//   }
//   .btn-default:hover {
//     background: linear-gradient(135deg, #5a8a3a, #6a9a4a);
//     transform: translateY(-1px);
//   }
//
// For more examples, see: https://www.ownerrez.com/support/articles/css-magic-widgets
// ============================================================================

// Note: Console warnings about "onMessage" for <inline-menu-ready> may appear
// when users click on name or email fields in the booking form. This warning
// originates from the OwnerRez iframe's internal JavaScript code and is triggered
// by browser autocomplete/autofill features or the widget's internal event handling.
// 
// This is a harmless warning that does not affect functionality. Due to cross-origin
// restrictions (Same-Origin Policy), we cannot access or suppress warnings from
// third-party iframes. The booking form continues to work correctly despite this warning.
// 
// If this warning becomes problematic, consider contacting OwnerRez support to report
// the issue, as they may be able to address it in a future widget update.

const BookingModal = ({ open, onClose }) => {
  const modalRef = useRef(null)
  const widgetRef = useRef(null)
  const bookingWidgetRef = useRef(null)

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
        <h3 id="booking-modal-title" className="booking-modal-title">Check Availability & Book Your Stay</h3>
        <IconButton
          icon="close"
          onClick={onClose}
          ariaLabel="Close booking modal"
        />
      </header>

      <div className="booking-modal-content" ref={widgetRef}>
        <div className="booking-modal-widgets">
          {/* Calendar Widget Section */}
          <section 
            className="booking-calendar-section"
            data-testid="booking-calendar-section"
          >
            <div className="booking-section-header">
              <h4 className="booking-section-title"></h4>
              <p className="booking-section-subtitle">Select your dates to see pricing</p>
            </div>
            <div className="booking-calendar-wrapper">
              <iframe
                src="https://app.ownerrez.com/widgets/4358a4dfa98a4c76b8dddbf1321cf487?view=form&propertyKey=d7a7ec3da8504c20a3eddd9b279455d9"
                title="Book Your Stay - OwnerRez Calendar"
                className="booking-calendar-iframe"
                frameBorder="0"
                allowFullScreen
                scrolling="no"
                data-testid="booking-calendar-iframe"
              ></iframe>
            </div>
          </section>
          {/* Booking/Inquiry Widget Section (if feature flag enabled) */}
          {ENABLE_BOOKING_WIDGET && (
            <section 
              className="booking-form-section"
              ref={bookingWidgetRef}
              data-testid="booking-form-section"
            >
              <div className="booking-section-divider"></div>
              <div className="booking-section-header">
                <h4 className="booking-section-title"></h4>
                <p className="booking-section-subtitle">Complete your reservation</p>
              </div>
              <div className="booking-form-wrapper">
                <iframe
                  src="https://app.ownerrez.com/widgets/eda7106106004555b54fed245577b515?view=form&propertyKey=d7a7ec3da8504c20a3eddd9b279455d9"
                  title="Book Your Stay - OwnerRez Booking Form"
                  className="booking-form-iframe"
                  frameBorder="0"
                  allowFullScreen
                  scrolling="no"
                  data-testid="booking-form-iframe"
                ></iframe>
              </div>
            </section>

          )}
        </div>
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

