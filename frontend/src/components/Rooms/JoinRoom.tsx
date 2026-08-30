import { LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { joinRoom } from "../../socket/socket";

import { notify } from "../../utils/notify";

import PasswordPromptModal from "../room/PasswordPromptModal";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { auth0Id, picture, username } = useAppSelector((state) => state.user);
  const publicRooms = useAppSelector((state) => state.rooms.publicRooms);

  const handleJoinRoom = () => {
    if (roomId.trim() === "") {
      notify("warning", "Missing Room Id", "");
      return;
    }

    const matchedRoom = publicRooms.find((r) => r.roomId === roomId.trim());
    if (matchedRoom?.isPrivate) {
      setShowPasswordModal(true);
    } else {
      joinRoom({
        auth0Id,
        picture,
        roomId: roomId.trim(),
        username,
      });
    }
  };

  const handlePasswordSubmit = (password: string) => {
    setShowPasswordModal(false);
    joinRoom({
      auth0Id,
      picture,
      roomId: roomId.trim(),
      password,
      username,
    });
  };
  return (
    <div
      className="
                bg-slate-900
                border
                border-slate-800
                rounded-3xl
                p-6
              "
    >
      <div className="flex items-center gap-2 mb-6">
        <LogIn className="text-violet-500" size={20} />
        <h2 className="text-xl font-semibold">Join Room</h2>
      </div>

      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
        className="
                  w-full
                  bg-slate-800
                  border
                  border-slate-700
                  rounded-xl
                  px-4
                  py-3
                  mb-4
                "
      />

      <motion.button
        whileHover={{
          scale: 1.02,
        }}
        whileTap={{
          scale: 0.98,
        }}
        className="
                  w-full
                  bg-violet-600
                  hover:bg-violet-700
                  py-3
                  rounded-xl
                  font-semibold
                "
        onClick={handleJoinRoom}
      >
        Join Room
      </motion.button>

      <PasswordPromptModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordSubmit}
        roomName={roomId}
      />
    </div>
  );
};

export default JoinRoom;
