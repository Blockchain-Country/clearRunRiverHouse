import Card from '../Cards/Card/Card'
import { ROOMS } from './RoomsObj'
import './Rooms.css'

const Rooms = () => {
    return (
        <>
            {ROOMS.map((obj) => (
                <Card
                    key={obj.title}
                    title={obj.title}
                    text={obj.text}
                    imageSrc={obj.imageSrc}
                    className="room-card"
                ></Card>
            ))}
        </>
    )
}

export default Rooms
