// Dynamically load all images from premiumAmenities folder
const allImageModules = import.meta.glob('../../../public/images/premiumAmenities/*.{jpg,jpeg,png,JPG,PNG}', {
    eager: true,
    as: 'url',
})

// Function to get images by filename prefix
const getImagesByPrefix = (prefix) => {
    const images = []
    Object.entries(allImageModules).forEach(([path, url]) => {
        // Extract filename from path: ../../../public/images/premiumAmenities/hot_tub_1.png
        const filename = path.split('/').pop()
        if (filename.startsWith(prefix)) {
            images.push({
                filename,
                url,
            })
        }
    })
    // Sort by filename to ensure consistent order
    return images.sort((a, b) => a.filename.localeCompare(b.filename))
}

// Premium Amenities data structure
// Each amenity can have multiple images
// Images are matched by filename prefix (e.g., hot_tub_*.png matches "hot_tub")
export const PREMIUM_AMENITIES = [
    {
        title: 'Outdoor Hot Tub',
        text: 'Soak under the stars, surrounded by tall trees and mountain air.',
        imagePrefix: 'hot_tub', // Matches hot_tub_1.png, hot_tub_2.png, etc.
    },
    {
        title: 'Private Sauna',
        text: 'Warm up and unwind after a day of skiing or hiking.',
        imagePrefix: 'sauna', // Matches sauna_1.png, sauna_2.png, etc.
    },
    {
        title: 'Billiards Room',
        text: 'Billiards, games, and a big-screen TV for movie nights.',
        imagePrefix: 'billiards', // Matches billiards_1.png, billiards_2.png, etc.
    },
    {
        title: 'Creek & Forest',
        text: 'Private access to Clear Run creek and scenic forest trails.',
        imagePrefix: 'creek', // Matches creek_1.png, creek_2.png, etc.
    },
]

// Function to get all images for all amenities
// Returns flattened array with image + title + text for Swiper
export const getAllAmenityImages = () => {
    const allItems = []
    
    PREMIUM_AMENITIES.forEach((amenity) => {
        const images = getImagesByPrefix(amenity.imagePrefix)
        images.forEach((img) => {
            allItems.push({
                image: img.url,
                title: amenity.title,
                text: amenity.text,
            })
        })
    })
    
    return allItems
}
