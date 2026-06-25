import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { reqCurrentSong } from "../../socket/socket";
import musicProfile from "../../assets/musicprofile.png";
import AudioController from "./AudioController";
import { setLoading } from "../../store/slices/PlayerSlice";

export default function MusicPlayer() {
  const currentRoom = useAppSelector((state) => state.rooms.currentRoom);
  const nowPlaying = currentRoom ? currentRoom.nowPlaying : null;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (nowPlaying == null && currentRoom) {
      dispatch(setLoading(true));
      reqCurrentSong(currentRoom.roomId);
    }
  }, [currentRoom]);

  return (
    <div
      className="
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-6

    lg:sticky
    lg:top-24
  "
    >
      <img
        src={nowPlaying ? nowPlaying.song.picture : musicProfile}
        alt="cover"
        className="
    w-full
    aspect-square
    object-cover
    rounded-2xl
  "
      />

      <div className="mt-6 text-center">
        <h2 className="text-2xl font-bold">
          {nowPlaying?.song.name || "No Song"}
        </h2>
      </div>

      <AudioController nowPlaying={nowPlaying} />
    </div>
  );
}
