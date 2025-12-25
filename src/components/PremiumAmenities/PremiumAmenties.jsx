import Modal from '../Modal/Modal'
import { PREMIUM_AMENITIES } from './PremiumAmentiesObj'
import './PremiumAmenties.css'

const PremiumAmenties = () => {
    const swiperItems = PREMIUM_AMENITIES.map((amenity) => ({
        title: amenity.title,
        text: amenity.text,
        image: amenity.imageSrc,
    }))

    return (
        <div className="premium-amenities-container">
            <Modal 
                open={true}
                items={swiperItems} 
                autoPlayInterval={3000} 
                showDots={true}
                showCloseButton={false}
                inline={true}
            />
        </div>
    )
}

export default PremiumAmenties
