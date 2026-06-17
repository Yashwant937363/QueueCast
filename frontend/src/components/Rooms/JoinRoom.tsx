import { LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { joinRoom } from "../../socket/socket";

import { notify } from "../../utils/notify";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const { auth0Id, picture, username } = useAppSelector((state) => state.user);
  const handleJoinRoom = () => {
    if (roomId.trim() === "") {
      notify("warning", "Missing Room Id", "");
      return;
    }
    joinRoom({
      auth0Id,
      picture,
      roomId,
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
    </div>
  );
};

export default JoinRoom;
