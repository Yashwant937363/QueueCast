import RoomHeader from "../components/room/RoomHeader";
import MusicPlayer from "../components/room/MusicPlayer";
import QueueList from "../components/room/QueueList";
import SearchPanel from "../components/room/SearchPanel";
import MobilePlayerBar from "../components/room/MobilePlayerBar";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppSelector } from "../store/hooks";
import { useEffect } from "react";
import { joinRoom } from "../socket/socket";
import { useParams } from "react-router";

export default function Room() {
  const { isLoading, isAuthenticated } = useAuth0();
  const { isPending } = useAppSelector((state) => state.user);
  const currentRoom = useAppSelector((state) => state.rooms.currentRoom);
  const { auth0Id, picture, username } = useAppSelector((state) => state.user);
  const { roomId } = useParams();
  console.log("Room ID: ", roomId);
  useEffect(() => {
    if (
      isAuthenticated &&
      !isPending &&
      !isLoading &&
      roomId &&
      roomId !== currentRoom?.roomId
    ) {
      joinRoom({
        auth0Id,
        picture,
        roomId,
        username,
      });
    }
  }, [isAuthenticated, isPending, isLoading]);
  return (
    <div className="p-6">
      <RoomHeader />

      <div
        className="
          grid
          lg:grid-cols-[420px_1fr]
          gap-8
        "
      >
        {/* Left */}

        <div className="hidden lg:flex flex-col gap-6 sticky top-24 h-fit">
          <MusicPlayer />

          <QueueList />
        </div>

        {/* Right */}

        <SearchPanel />
      </div>

      <MobilePlayerBar />
    </div>
  );
}
