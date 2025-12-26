// Import all images at module level (import.meta.glob must be called at top level)
const allImageModules = import.meta.glob('../../../public/images/*/*.{jpg,jpeg,png,JPG,PNG}', {
    eager: true,
    as: 'url',
})

// Function to dynamically import all images from a specific folder
const getImagesFromFolder = (folderName) => {
    const images = []
    Object.entries(allImageModules).forEach(([path, url]) => {
        // Match the folder name in the path
        // Path format: ../../../public/images/master_bedroom/mb_1.png
        const match = path.match(/images\/([^/]+)\//)
        if (match && match[1] === folderName) {
            images.push(url)
        }
    })
    
    // Sort images to ensure consistent order
    return images.sort()
}

// Room folder mappings - maps bedroom titles to folder names
const ROOM_FOLDERS = {
    'Master Bedroom': 'master_bedroom',
    'Warm Bedroom': 'warm_bedroom',
    'Side Bedroom': 'side_bedroom',
    'Sun Bedroom': 'sun_bedroom',
    'Passage Bedroom': 'passage_bedroom',
    'Kids Bedroom': 'kids_bedroom',
}

// Function to get all images for a room
const getRoomImages = (roomTitle) => {
    const folderName = ROOM_FOLDERS[roomTitle]
    if (!folderName) return []
    return getImagesFromFolder(folderName)
}

export const BEDROOMS = [
    {
        title: 'Master Bedroom',
        text: 'King bed, forest views, ensuite bathroom.',
        folder: 'master_bedroom',
        images: getRoomImages('Master Bedroom'),
    },
    {
        title: 'Warm Bedroom',
        text: 'Bedroom on the 1st floor. King bed, shared bathroom. The warmest bedroom in the house.',
        folder: 'warm_bedroom',
        images: getRoomImages('Warm Bedroom'),
    },
    {
        title: 'Side Bedroom',
        text: 'Spacious side bedroom on the 1st floor. King bed, couch, quiet corner of the house with a side entrance.',
        folder: 'side_bedroom',
        images: getRoomImages('Side Bedroom'),
    },
    {
        title: 'Sun Bedroom',
        text: 'Sunny bedroom on the 2nd floor. King bed, shared bathroom.',
        folder: 'sun_bedroom',
        images: getRoomImages('Sun Bedroom'),
    },
    {
        title: 'Passage Bedroom',
        text: 'Pass-through bedroom on the 2nd floor with two full-size beds. Shared bathroom.',
        folder: 'passage_bedroom',
        images: getRoomImages('Passage Bedroom'),
    },
    {
        title: 'Kids Bedroom',
        text: 'Kids bedroom on the 2nd floor with a bunk bed and a computer desk with a 27" monitor. Shared bathroom.',
        folder: 'kids_bedroom',
        images: getRoomImages('Kids Bedroom'),
    },
]
