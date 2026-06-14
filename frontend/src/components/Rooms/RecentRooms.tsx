import type Room from "../../types/Room";
import RoomCard from "./RoomCard";

const recentRooms: Room[] = [
  {
    id: "ABC123",
    name: "Birthday Party",
    currentUsers: 8,
    maxUsers: 20,
    isPrivate: true,
  },
  {
    id: "XYZ456",
    name: "Weekend Vibes",
    currentUsers: 5,
    maxUsers: 15,
    isPrivate: true,
  },
];

const RecentRooms: React.FC = () => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-6 w-1 rounded-full bg-violet-500" />

        <h2 className="text-2xl font-semibold">Recently Joined Rooms</h2>
      </div>

      <div className="grid gap-4">
        {recentRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </section>
  );
};

export default RecentRooms;
