import { Plus } from "lucide-react";
import { motion } from "motion/react";
import type { Song } from "../../types/music";

type Props = {
  song: Song;
};

export default function SongCard({ song }: Props) {
  return (
    <motion.div
      whileHover={{
        y: -2,
        scale: 1.01,
      }}
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-3
        flex
        justify-between
      "
    >
      <div className="flex gap-3">
        <img src={song.image} className="w-16 h-16 rounded-xl" />

        <div>
          <h3>{song.title}</h3>

          <p className="text-slate-400 text-sm">{song.artist}</p>
        </div>
      </div>

      <button
        className="
          bg-violet-600
          px-4
          rounded-xl
          cursor-pointer
        "
      >
        <Plus />
      </button>
    </motion.div>
  );
}
