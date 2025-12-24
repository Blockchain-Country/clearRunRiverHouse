import React, { useEffect, useRef } from 'react';
import Swiper from '../Swiper/Swiper';
import './ModalGallery.css';

const ModalGallery = ({ open, title, images, index, onClose, onPrev, onNext, useSwiper = false, description = '' }) => {
  const modalRef = useRef(null);
  const scrollYRef = useRef(0);

  // Prevent body scroll when modal is open
  // Using overflow: hidden technique - simpler and doesn't require scroll restoration
  useEffect(() => {
    if (open) {
      // Save current scroll position (for reference, though we won't need to restore it)
      scrollYRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      
      // Lock scroll using overflow: hidden
      // This is simpler than position:fixed and doesn't require scroll restoration
      const body = document.body;
      const html = document.documentElement;
      
      // Prevent scrolling on body and html
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      
      // Also prevent touch scrolling on mobile
      body.style.touchAction = 'none';
    } else {
      // Simply restore overflow styles - no scroll restoration needed!
      const body = document.body;
      const html = document.documentElement;
      
      body.style.overflow = '';
      html.style.overflow = '';
      body.style.touchAction = '';
      
      scrollYRef.current = 0;
    }
    
    // Cleanup function for unmount
    return () => {
      const body = document.body;
      const html = document.documentElement;
      
      body.style.overflow = '';
      html.style.overflow = '';
      body.style.touchAction = '';
      scrollYRef.current = 0;
    };
  }, [open]);

  // Handle Escape key and focus management
  useEffect(() => {
    if (!open) return;
    
    const handler = (event) => {
      if (event.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handler);
    
    // Focus the modal when it opens
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  if (!images || images.length === 0) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  // Convert images to Swiper format
  const swiperItems = images.map((img, idx) => ({
    title: idx === 0 ? title : '',
    text: idx === 0 ? description : '',
    image: img,
  }));

  return (
    <div 
      className="modal-gallery-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-gallery-title"
    >
      <div 
        className="modal-gallery"
        ref={modalRef}
        tabIndex={-1}
      >
        <header className="modal-gallery-header">
          <h3 id="modal-gallery-title" className="modal-gallery-title">{title}</h3>
          <button
            type="button"
            className="modal-gallery-close"
            onClick={onClose}
            aria-label="Close gallery"
          >
            ✕
          </button>
        </header>

        <div className="modal-gallery-body">
          {useSwiper ? (
            <div className="modal-gallery-swiper">
              <Swiper 
                items={swiperItems} 
                autoPlayInterval={0} 
                showDots={true}
              />
            </div>
          ) : (
            <>
              <button type="button" className="modal-gallery-nav prev" onClick={onPrev}>
                ‹
              </button>
              <figure className="modal-gallery-figure">
                <img src={images[index]} alt={title} />
                <figcaption className="modal-gallery-caption">
                  {index + 1} / {images.length}
                </figcaption>
              </figure>
              <button type="button" className="modal-gallery-nav next" onClick={onNext}>
                ›
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalGallery;
