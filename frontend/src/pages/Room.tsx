import RoomHeader from "../components/room/RoomHeader";
import MusicPlayer from "../components/room/MusicPlayer";
import QueueList from "../components/room/QueueList";
import SearchPanel from "../components/room/SearchPanel";
import PasswordPromptModal from "../components/room/PasswordPromptModal";

import { useAuth0 } from "@auth0/auth0-react";
import { useAppSelector } from "../store/hooks";
import { useEffect, useState } from "react";
import { joinRoom } from "../socket/socket";
import { useParams, useSearchParams } from "react-router";

export default function Room() {
  const { isLoading } = useAuth0();
  const { isPending } = useAppSelector((state) => state.user);
  const currentRoom = useAppSelector((state) => state.rooms.currentRoom);
  const { auth0Id, picture, username } = useAppSelector((state) => state.user);
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const passParam = searchParams.get("pass") || undefined;

  useEffect(() => {
    if (
      !isLoading &&
      !isPending &&
      auth0Id &&
      roomId &&
      roomId !== currentRoom?.roomId
    ) {
      joinRoom({
        auth0Id,
        picture,
        roomId,
        password: passParam,
        username,
      });
    }
  }, [auth0Id, isLoading, isPending, roomId, currentRoom?.roomId, passParam]);

  useEffect(() => {
    const handlePasswordRequired = (e: any) => {
      setShowPasswordModal(true);
      setPasswordError(e?.detail?.message || "Password is required");
    };

    window.addEventListener(
      "room-join-password-required",
      handlePasswordRequired,
    );

    return () => {
      window.removeEventListener(
        "room-join-password-required",
        handlePasswordRequired,
      );
    };
  }, []);

  const handlePasswordSubmit = (password: string) => {
    setShowPasswordModal(false);
    setPasswordError("");
    if (auth0Id && roomId) {
      joinRoom({
        auth0Id,
        picture,
        roomId,
        password,
        username,
      });
    }
  };
  // useEffect(() => {
  //   return () => leaveRoom();
  // }, []);
  return (
    <div className="p-4 md:p-6">
      <RoomHeader />
      <div
        className="
    grid
    gap-8
    lg:grid-cols-[420px_1fr]
  "
      >
        <div className="space-y-6">
          <MusicPlayer />

          <QueueList />
        </div>

        <SearchPanel />
      </div>

      <PasswordPromptModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordSubmit}
        roomName={currentRoom?.name || roomId}
        error={passwordError}
      />
    </div>
  );
}
