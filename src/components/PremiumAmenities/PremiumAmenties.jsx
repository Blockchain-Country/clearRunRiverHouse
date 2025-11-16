import Card from '../Cards/Card/Card'
import { PREMIUM_AMENITIES } from './PremiumAmentiesObj'
import './PremiumAmenties.css'

const PremiumAmenties = () => {
    return (
        <>
            {PREMIUM_AMENITIES.map((obj) => (
                <Card
                    key={obj.title}
                    title={obj.title}
                    text={obj.text}
                    imageSrc={obj.imageSrc}
                    className="premium-amenity-card"
                ></Card>
            ))}
        </>
    )
}

export default PremiumAmenties
