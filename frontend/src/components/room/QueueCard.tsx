import { Heart } from "lucide-react";
import type { QueueSong } from "../../types/music";

type Props = {
  song: QueueSong;
};

export default function QueueCard({ song }: Props) {
  console.log(song.image);
  return (
    <div
      className="
        bg-slate-900
        border border-slate-800
        hover:border-violet-500/30
        transition
        rounded-2xl
        p-3
      "
    >
      <div className="flex items-center gap-3">
        {/* Album Art */}
        <img
          src={song.image}
          alt={song.title}
          className="
            w-14
            h-14
            rounded-xl
            object-cover
            shrink-0
          "
        />

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{song.title}</h3>

          <p className="text-sm text-slate-400 truncate">{song.artist}</p>
        </div>

        {/* Votes */}
        <button
          className="
            flex
            items-center
            gap-1
            text-pink-500
            hover:scale-110
            transition
          "
        >
          <Heart size={16} fill="currentColor" />

          <span>{song.votes}</span>
        </button>
      </div>
    </div>
  );
}
