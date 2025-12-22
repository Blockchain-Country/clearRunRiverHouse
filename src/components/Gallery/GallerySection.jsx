import React, { useMemo, useState } from 'react';
import ModalGallery from './ModalGallery.jsx';
import './Gallery.css';

const GALLERY_ITEMS = [
  { label: 'House exterior', folder: 'outdoor', description: 'Front of the house and forest views.' },
  { label: 'Deck and river', folder: 'deck', description: 'Deck lounge area and Clear Run creek.' },
  { label: 'Outdoor hot tub', folder: 'hot_tub', description: 'Hot tub surrounded by trees.' },
  { label: 'Sauna', folder: 'sauna', description: 'Private cedar sauna.' },
  { label: 'Game room', folder: 'billiard_room', description: 'Pool table and entertainment zone.' },
  { label: 'Master bedroom', folder: 'master_bedroom', description: 'Main suite with king bed.' },
];

const GallerySection = ({ items = null, sectionId = 'gallery', sectionTitle = 'Photo Gallery', sectionSubtitle = null }) => {
  const galleryItems = items || GALLERY_ITEMS;
  const [isOpen, setIsOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize items to have consistent structure
  const normalizedItems = useMemo(() => {
    return galleryItems.map((item, index) => {
      if (item.folder) {
        return item; // Already in correct format
      }
      // Convert room-style items to gallery format
      const folderId = item.title?.toLowerCase().replace(/\s+/g, '_') || `item_${index}`;
      return {
        label: item.title,
        description: item.text,
        folder: folderId,
        imageSrc: item.imageSrc,
      };
    });
  }, [galleryItems]);

  const imagesByFolder = useMemo(() => {
    const modules = import.meta.glob('../../assets/images/*/*.{jpg,jpeg,png}', {
      eager: true,
      as: 'url',
    });
    const grouped = {};
    Object.entries(modules).forEach(([path, url]) => {
      const match = path.match(/assets\/images\/([^/]+)\//);
      if (!match) return;
      const folder = match[1];
      if (!grouped[folder]) grouped[folder] = [];
      grouped[folder].push(url);
    });
    Object.values(grouped).forEach(list => list.sort());
    
    // Also add direct image sources from items
    normalizedItems.forEach((item) => {
      if (item.imageSrc) {
        if (!grouped[item.folder]) {
          grouped[item.folder] = [];
        }
        if (!grouped[item.folder].includes(item.imageSrc)) {
          grouped[item.folder].push(item.imageSrc);
        }
      }
    });
    
    return grouped;
  }, [normalizedItems]);

  const handleOpen = (folder) => {
    const list = imagesByFolder[folder];
    if (!list || list.length === 0) return;
    setCurrentFolder(folder);
    setCurrentIndex(0);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handlePrev = () => {
    const list = imagesByFolder[currentFolder] || [];
    if (!list.length) return;
    setCurrentIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  const handleNext = () => {
    const list = imagesByFolder[currentFolder] || [];
    if (!list.length) return;
    setCurrentIndex((prev) => (prev + 1) % list.length);
  };

  const activeItem = currentFolder
    ? normalizedItems.find((i) => i.folder === currentFolder)
    : null;
  const activeImages = currentFolder ? imagesByFolder[currentFolder] || [] : [];

  const defaultSubtitle = sectionSubtitle || 'Click any card to open a fullscreen gallery. Images are loaded automatically from folders in src/assets/images.';

  return (
    <section id={sectionId} className="gallery">
      <div className="section-inner">
        <div className="section-header">
          <h2 className="section-title">{sectionTitle}</h2>
          {sectionSubtitle !== false && (
            <p className="section-subtitle">
              {defaultSubtitle}
            </p>
          )}
        </div>

        <div className="gallery-grid">
          {normalizedItems.map((item) => {
            const hasImages =
              imagesByFolder[item.folder] && imagesByFolder[item.folder].length > 0;
            return (
              <button
                key={item.folder}
                type="button"
                className="gallery-card"
                onClick={() => handleOpen(item.folder)}
                disabled={!hasImages}
              >
                <div 
                  className="gallery-card-thumb"
                  style={item.imageSrc ? {
                    backgroundImage: `url(${item.imageSrc})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {}}
                />
                <div className="gallery-card-body">
                  <h3 className="gallery-card-title">{item.label}</h3>
                  <p className="gallery-card-text">{item.description}</p>
                  {!hasImages && (
                    <p className="gallery-card-empty">
                      Add images to <code>{item.folder}</code> folder to enable.
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <ModalGallery
        open={isOpen}
        title={activeItem?.label || activeItem?.title || ''}
        images={activeImages}
        index={currentIndex}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
        useSwiper={sectionId === 'rooms'}
        description={activeItem?.description || activeItem?.text || ''}
      />
    </section>
  );
};

export default GallerySection;
