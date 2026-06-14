import SongCard from "./SongCard";
import type { Song } from "../../types/music";

type Props = {
  songs: Song[];
};

export default function SearchResults({ songs }: Props) {
  return (
    <div className="space-y-3">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}
