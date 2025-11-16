import React, { useEffect } from 'react';
import './ModalGallery.css';

const ModalGallery = ({ open, title, images, index, onClose, onPrev, onNext }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onPrev();
      if (event.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;
  if (!images || images.length === 0) return null;

  const current = images[index];

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

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
          <button type="button" className="modal-gallery-nav prev" onClick={onPrev}>
            ‹
          </button>
          <figure className="modal-gallery-figure">
            <img src={current} alt={title} />
            <figcaption className="modal-gallery-caption">
              {index + 1} / {images.length}
            </figcaption>
          </figure>
          <button type="button" className="modal-gallery-nav next" onClick={onNext}>
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGallery;
