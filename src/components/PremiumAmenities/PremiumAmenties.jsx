import Swiper from '../Swiper/Swiper'
import { PREMIUM_AMENITIES } from './PremiumAmentiesObj'
import './PremiumAmenties.css'

const PremiumAmenties = () => {
    const swiperItems = PREMIUM_AMENITIES.map((amenity) => ({
        title: amenity.title,
        text: amenity.text,
        image: amenity.imageSrc,
    }))

    return (
        <div className="premium-amenities-swiper">
            <Swiper items={swiperItems} autoPlayInterval={3000} showDots={true} />
        </div>
    )
}

export default PremiumAmenties
