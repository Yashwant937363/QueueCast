import { useAppSelector } from "../../store/hooks";
import NothingSection from "../NothingSection";
import RoomCard from "./RoomCard";

const PublicRooms: React.FC = () => {
  const publicRooms = useAppSelector((state) => state.rooms.publicRooms);
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-6 w-1 rounded-full bg-violet-500" />

        <h2 className="text-2xl font-semibold">Public Rooms</h2>
      </div>

      {publicRooms.length === 0 ? (
        <NothingSection message="no rooms" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {publicRooms.map((room) => (
            <RoomCard key={room.roomId} room={room} />
          ))}
        </div>
      )}
    </section>
  );
};

export default PublicRooms;
