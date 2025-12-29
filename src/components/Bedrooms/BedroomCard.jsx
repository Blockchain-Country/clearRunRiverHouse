import React, { useState, useMemo } from 'react'
import Swiper from '../ui/Swiper/Swiper'
import Modal from '../ui/Modal/Modal'
import './BedroomCard.css'

const BedroomCard = ({ bedroom }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const hasImages = bedroom.images && bedroom.images.length > 0

    // Convert bedroom images to Swiper format
    const swiperItems = useMemo(() => {
        if (!bedroom.images || bedroom.images.length === 0) return []
        return bedroom.images.map((img) => ({
            image: img,
            title: bedroom.title,
            text: bedroom.text,
        }))
    }, [bedroom])

    // Convert bedroom images to Modal format
    // All images in the same folder share the same title and text
    const modalItems = useMemo(() => {
        if (!bedroom.images || bedroom.images.length === 0) return []
        return bedroom.images.map((img) => ({
            image: img,
            title: bedroom.title,
            text: bedroom.text,
        }))
    }, [bedroom])

    const handleOpen = () => {
        if (hasImages) {
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
                className="bedroom-card"
                onClick={handleOpen}
                disabled={!hasImages}
            >
                <div className="bedroom-card-thumb">
                    {hasImages && swiperItems.length > 0 ? (
                        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                            <Swiper 
                                items={swiperItems}
                                autoPlayInterval={4000}
                                // showDots={false}
                                // showDots={swiperItems.length > 1}
                            />
                        </div>
                    ) : null}
                </div>
                <div className="bedroom-card-body">
                    <h3 className="bedroom-card-title">{bedroom.title}</h3>
                    <p className="bedroom-card-text">{bedroom.text}</p>
                    {!hasImages && (
                        <p className="bedroom-card-empty">
                            Add images to <code>{bedroom.folder}</code> folder to enable.
                        </p>
                    )}
                </div>
            </button>

            <Modal
                open={isModalOpen}
                title={bedroom.title}
                items={modalItems}
                onClose={handleClose}
                showCloseButton={true}
                autoPlayInterval={4000}
                showDots={modalItems.length > 1}
            />
        </>
    )
}

export default BedroomCard

