import React, { useState, useMemo } from 'react'
import Modal from '../ui/Modal/Modal'
import './AmenityCard.css'

const AmenityCard = ({ amenity }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const modalItems = useMemo(() => {
        if (!amenity.imageSrc) return []
        return [{
            image: amenity.imageSrc,
            title: amenity.title,
            text: amenity.text,
        }]
    }, [amenity])

    const handleOpen = () => {
        if (amenity.imageSrc) {
            setIsModalOpen(true)
        }
    }

    const handleClose = () => {
        setIsModalOpen(false)
    }

    return (
        <>
            <button
                type="button"
                className="amenity-card"
                onClick={handleOpen}
                disabled={!amenity.imageSrc}
            >
                <div className="amenity-card-thumb">
                    {amenity.imageSrc ? (
                        <div 
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${amenity.imageSrc})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }} 
                        />
                    ) : null}
                </div>
                <div className="amenity-card-body">
                    <h3 className="amenity-card-title">{amenity.title}</h3>
                    <p className="amenity-card-text">{amenity.text}</p>
                </div>
            </button>

            <Modal
                open={isModalOpen}
                title={amenity.title}
                items={modalItems}
                onClose={handleClose}
                showCloseButton={true}
                autoPlayInterval={0}
                showDots={false}
            />
        </>
    )
}

export default AmenityCard

