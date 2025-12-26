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
        // Path format: ../../../public/images/br_master/mb_1.png
        const match = path.match(/images\/([^/]+)\//)
        if (match && match[1] === folderName) {
            images.push(url)
        }
    })
    
    // Sort images to ensure consistent order
    return images.sort()
}

// Room folder mappings
const ROOM_FOLDERS = {
    'Master Bedroom': 'br_master',
    'Guest Bedroom 1': 'br_1',
    'Guest Bedroom 2': 'br_2',
    'Guest Bedroom 3': 'br_3',
    'Guest Bedroom 4': 'br_4',
    'Guest Bedroom 5': 'br_5',
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
        folder: 'br_master',
        images: getRoomImages('Master Bedroom'),
    },
    {
        title: 'Guest Bedroom 1',
        text: 'Bedroom at the 1st Floor. King bed, shared bathroom.',
        folder: 'br_1',
        images: getRoomImages('Guest Bedroom 1'),
    },
    {
        title: 'Guest Bedroom 2',
        text: 'A huge Side Bedroom at the 1st floor. King bed, with couch, quiet corner of the house and has a side door',
        folder: 'br_2',
        images: getRoomImages('Guest Bedroom 2'),
    },
    {
        title: 'Guest Bedroom 3',
        text: 'Bedroom at the 2nd floor. Sunshine Room. King bed, shared bathroom.',
        folder: 'br_3',
        images: getRoomImages('Guest Bedroom 3'),
    },
    {
        title: 'Guest Bedroom 4',
        text: 'Bedroom at the 2nd floor with two Full size beds, shared bathroom.',
        folder: 'br_4',
        images: getRoomImages('Guest Bedroom 4'),
    },
    {
        title: 'Guest Bedroom 5',
        text: 'Bedroom at the 2nd floor. Good for the little ones.  balk bed and a computer desk with 27" monintor, shared bathroom.',
        folder: 'br_5',
        images: getRoomImages('Guest Bedroom 5'),
    },
]

