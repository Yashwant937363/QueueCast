import { motion } from "motion/react";
import type { Song } from "../../types/Song";
import { addSong } from "../../socket/socket";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addSongToRoom } from "../../store/slices/RoomsSlice";

type Props = {
  song: Song;
};

export default function SongCard({ song }: Props) {
  const { waitingSongs } = useAppSelector((state) => state.rooms);
  const dispatch = useAppDispatch();
  const isAdding = waitingSongs.includes(song.id);

  const handleAddSong = () => {
    if (isAdding) return;
    dispatch(addSongToRoom(song.id));
    addSong(song);
  };

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
        flex-col
        justify-between
        gap-2
        h-full
      "
    >
      <img src={song.picture} className="w-full rounded-xl" />

      <div>
        <h3>{song.name}</h3>
      </div>

      <button
        disabled={isAdding}
        className="
          bg-violet-600
          px-4
          rounded-xl
          cursor-pointer
          p-2
          disabled:opacity-70
          disabled:cursor-not-allowed
          flex
          items-center
          justify-center
          gap-2
        "
        onClick={handleAddSong}
      >
        {isAdding ? (
          <>
            <span
              className="
                h-4
                w-4
                border-2
                border-white/30
                border-t-white
                rounded-full
                animate-spin
              "
            />
            Adding...
          </>
        ) : (
          "Add to Queue"
        )}
      </button>
    </motion.div>
  );
}
