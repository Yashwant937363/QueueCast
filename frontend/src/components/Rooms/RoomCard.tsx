import { motion } from "motion/react";
import { Lock, Globe, Users } from "lucide-react";
import type Room from "../../types/Room";

const RoomCard = ({ room }: { room: Room }) => {
  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-5
      "
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{room.name}</h3>

        {room.isPrivate ? (
          <div
            className="
              flex items-center gap-1
              text-yellow-400 text-sm
            "
          >
            <Lock size={14} />
            Private
          </div>
        ) : (
          <div
            className="
              flex items-center gap-1
              text-green-400 text-sm
            "
          >
            <Globe size={14} />
            Public
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-slate-400 text-sm">Room ID</p>

        <p className="font-mono text-violet-400">{room.id}</p>

        <div className="flex items-center gap-2 text-slate-300">
          <Users size={16} />

          <span>
            {room.currentUsers} / {room.maxUsers}
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{
          scale: 1.03,
        }}
        whileTap={{
          scale: 0.97,
        }}
        className="
          mt-5
          w-full
          bg-violet-600
          hover:bg-violet-700
          py-2.5
          rounded-xl
          font-medium
          transition-colors
        "
      >
        Join Room
      </motion.button>
    </motion.div>
  );
};
export default RoomCard;
