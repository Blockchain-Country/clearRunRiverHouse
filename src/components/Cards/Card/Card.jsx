import './Card.css'

const Card = ({ title, text, imageSrc, className = '' }) => {
    return (
        <article className={`card ${className}`}>
            <h3 className="card__title">{title}</h3>

            {imageSrc && (
                <div className="card__image-wrapper">
                    <img src={imageSrc} alt={title} className="card__image" />
                </div>
            )}

            <p className="card__text">{text}</p>
        </article>
    )
}

export default Card
