import React, { useEffect } from 'react';
import Swiper from '../Swiper/Swiper';
import './ModalGallery.css';

const ModalGallery = ({ open, title, images, index, onClose, onPrev, onNext, useSwiper = false, description = '' }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
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
    <div className="modal-gallery-backdrop" onClick={handleBackdropClick}>
      <div className="modal-gallery">
        <header className="modal-gallery-header">
          <h3 className="modal-gallery-title">{title}</h3>
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
