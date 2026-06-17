import { useAppSelector } from "../../store/hooks";
import RoomCard from "./RoomCard";

const RecentRooms: React.FC = () => {
  const privateRooms = useAppSelector((state) => state.rooms.privateRooms);
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-6 w-1 rounded-full bg-violet-500" />

        <h2 className="text-2xl font-semibold">Private Rooms</h2>
      </div>

      <div className="grid gap-4">
        {privateRooms.map((room) => (
          <RoomCard key={room.roomId} room={room} />
        ))}
      </div>
    </section>
  );
};

export default RecentRooms;
