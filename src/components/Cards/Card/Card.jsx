import './Card.css'

const Card = ({ title, text, imageSrc, images, className = '' }) => {
    // Support both single imageSrc (backward compatibility) and images array
    const imageList = images && images.length > 0 ? images : (imageSrc ? [imageSrc] : [])

    return (
        <article className={`card ${className}`}>
            <h3 className="card__title">{title}</h3>

            {imageList.length > 0 && (
                <div 
                    className="card__image-wrapper"
                    style={imageList.length > 1 ? {
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(imageList.length, 3)}, 1fr)`,
                        gap: '0.5rem'
                    } : {}}
                >
                    {imageList.map((img, index) => (
                        <img 
                            key={index} 
                            src={img} 
                            alt={`${title} - Image ${index + 1}`} 
                            className="card__image" 
                        />
                    ))}
                </div>
            )}

            <p className="card__text">{text}</p>
        </article>
    )
}

export default Card
