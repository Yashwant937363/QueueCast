import { Play, Pause } from "lucide-react";
import { motion } from "motion/react";

type Props = {
  song: {
    title: string;
    artist: string;
    image: string;
  };
  isPlaying: boolean;
  onToggle: () => void;
  onOpen: () => void;
};

export default function MobilePlayerBar({
  song,
  isPlaying,
  onToggle,
  onOpen,
}: Props) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="
        lg:hidden
        fixed
        bottom-0
        left-0
        right-0
        z-40
        bg-slate-900/95
        backdrop-blur-md
        border-t
        border-slate-800
        px-4
        py-3
      "
    >
      <div className="flex items-center gap-3">
        <button className="flex flex-1 items-center gap-3" onClick={onOpen}>
          <img
            src={song.image}
            alt={song.title}
            className="
              w-12
              h-12
              rounded-xl
              object-cover
            "
          />

          <div className="text-left">
            <p className="font-medium truncate">{song.title}</p>

            <p className="text-xs text-slate-400 truncate">{song.artist}</p>
          </div>
        </button>

        <button
          onClick={onToggle}
          className="
            bg-violet-600
            hover:bg-violet-700
            rounded-full
            p-3
            transition
          "
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
    </motion.div>
  );
}
