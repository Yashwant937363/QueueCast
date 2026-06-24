import { Heart } from "lucide-react";
import type { Song } from "../../types/Song";
import { useAppDispatch } from "../../store/hooks";
import { setSongLiked } from "../../store/slices/RoomsSlice";
import { likeSong } from "../../socket/socket";

type Props = {
  song: Song;
};

export default function QueueCard({ song }: Props) {
  const dispatch = useAppDispatch();
  const handleLike = () => {
    dispatch(
      setSongLiked({
        isLiked: !song.isLiked,
        songId: song.id,
      }),
    );
    likeSong({
      isLiked: !song.isLiked,
      songId: song.id,
    });
  };
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
          src={song.picture}
          alt={song.name}
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
          <h3 className="font-medium truncate">{song.name}</h3>
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
          onClick={handleLike}
        >
          <Heart size={16} fill={song.isLiked ? "currentColor" : ""} />

          <span>{song.likes}</span>
        </button>
      </div>
    </div>
  );
}
