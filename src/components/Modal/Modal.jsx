import React, { useEffect, useRef } from 'react';
import Swiper from '../Swiper/Swiper';
import './Modal.css';

const Modal = ({ 
  open, 
  title, 
  items, 
  onClose, 
  showCloseButton = true,
  autoPlayInterval = 0,
  showDots = true,
  description = '',
  inline = false
}) => {
  const modalRef = useRef(null);
  const scrollYRef = useRef(0);

  // Prevent body scroll when modal is open (only if not inline)
  useEffect(() => {
    if (inline) return; // Don't lock scroll for inline mode
    
    if (open) {
      scrollYRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      
      const body = document.body;
      const html = document.documentElement;
      
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      body.style.touchAction = 'none';
    } else {
      const body = document.body;
      const html = document.documentElement;
      
      body.style.overflow = '';
      html.style.overflow = '';
      body.style.touchAction = '';
      
      scrollYRef.current = 0;
    }
    
    return () => {
      const body = document.body;
      const html = document.documentElement;
      
      body.style.overflow = '';
      html.style.overflow = '';
      body.style.touchAction = '';
      scrollYRef.current = 0;
    };
  }, [open, inline]);

  // Handle Escape key and focus management
  useEffect(() => {
    if (!open || !showCloseButton) return;
    
    const handler = (event) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handler);
    
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, showCloseButton]);

  if (!open) return null;
  if (!items || items.length === 0) return null;

  const handleBackdropClick = (event) => {
    if (showCloseButton && event.target === event.currentTarget && onClose) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className={`modal ${inline ? 'modal-inline' : ''}`}
      ref={modalRef}
      tabIndex={-1}
    >
      {(title || showCloseButton) && (
        <header className="modal-header">
          {title && (
            <h3 id="modal-title" className="modal-title">{title}</h3>
          )}
          {showCloseButton && (
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </header>
      )}

      <div className="modal-body">
        <div className="modal-swiper">
          <Swiper 
            items={items} 
            autoPlayInterval={autoPlayInterval} 
            showDots={showDots}
          />
        </div>
      </div>
    </div>
  );

  if (inline) {
    return modalContent;
  }

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {modalContent}
    </div>
  );
};

export default Modal;

