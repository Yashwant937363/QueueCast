import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
  Heart,
  ListMusic,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type Props = {
  open: boolean;
  onClose: () => void;
  isPlaying: boolean;
  onToggle: () => void;
};

export default function MobilePlayerModal({
  open,
  onClose,
  isPlaying,
  onToggle,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{
            type: "spring",
            damping: 25,
          }}
          className="
            fixed
            inset-0
            z-50
            bg-slate-950
            p-6
          "
        >
          {/* Header */}

          <div className="flex justify-between items-center">
            <button onClick={onClose}>
              <X />
            </button>

            <h3 className="font-medium">QueueCast</h3>

            <ListMusic />
          </div>

          {/* Cover */}

          <div className="mt-10">
            <img
              src="https://picsum.photos/500"
              alt=""
              className="
                w-full
                rounded-3xl
                aspect-square
                object-cover
              "
            />
          </div>

          {/* Song Info */}

          <div className="mt-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Believer</h2>

              <p className="text-slate-400">Imagine Dragons</p>
            </div>

            <button>
              <Heart className="text-pink-500" fill="currentColor" />
            </button>
          </div>

          {/* Progress */}

          <div className="mt-8">
            <div className="h-1 bg-slate-800 rounded-full">
              <div className="h-full w-1/3 bg-violet-500 rounded-full" />
            </div>

            <div className="flex justify-between text-xs mt-2 text-slate-400">
              <span>1:24</span>
              <span>3:56</span>
            </div>
          </div>

          {/* Controls */}

          <div className="flex justify-center items-center gap-8 mt-10">
            <button>
              <SkipBack size={32} />
            </button>

            <button
              onClick={onToggle}
              className="
                w-16
                h-16
                rounded-full
                bg-violet-600
                flex
                items-center
                justify-center
              "
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>

            <button>
              <SkipForward size={32} />
            </button>
          </div>

          {/* Queue Info */}

          <div
            className="
              mt-10
              bg-slate-900
              border
              border-slate-800
              rounded-2xl
              p-4
            "
          >
            <p className="text-slate-400 text-sm">Up Next</p>

            <p className="mt-2">Heat Waves • Glass Animals</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
