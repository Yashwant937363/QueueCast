import type Room from "../../types/Room";
import RoomCard from "./RoomCard";

const publicRooms: Room[] = [
  {
    id: "ROOM01",
    name: "Office Chill",
    currentUsers: 12,
    maxUsers: 30,
    isPrivate: false,
  },
  {
    id: "ROOM02",
    name: "Gaming Night",
    currentUsers: 16,
    maxUsers: 25,
    isPrivate: false,
  },
  {
    id: "ROOM03",
    name: "EDM Lovers",
    currentUsers: 22,
    maxUsers: 50,
    isPrivate: false,
  },
];
const PublicRooms: React.FC = () => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-6 w-1 rounded-full bg-violet-500" />

        <h2 className="text-2xl font-semibold">Public Rooms</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {publicRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </section>
  );
};

export default PublicRooms;
