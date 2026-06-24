import QueueCard from "./QueueCard";
import { useAppSelector } from "../../store/hooks";
import "./QueueList.css";
import { motion } from "motion/react";
import NothingSection from "../NothingSection";

export default function QueueList() {
  const currentRoom = useAppSelector((state) => state.rooms.currentRoom);
  const sortedSongs =
    currentRoom && currentRoom.songs
      ? [...currentRoom.songs].sort((a, b) => b.likes - a.likes)
      : [];
  return (
    <div
      className="
        bg-slate-900
        border border-slate-800
        rounded-3xl
        p-5
        flex
        flex-col
      "
    >
      <h2 className="text-xl font-semibold mb-4">Queue</h2>

      <div
        className="
          space-y-3
          overflow-y-auto
          max-h-125
          queue-scrollbar
        "
      >
        {sortedSongs.length === 0 ? (
          <NothingSection message="No Songs" />
        ) : (
          sortedSongs.map((song) => (
            <motion.div
              key={song.id}
              layout
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <QueueCard song={song} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
