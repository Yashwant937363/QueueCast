import type { Song } from "../../types/Song";
import SongCard from "./SongCard";
import { SongCardSkeleton } from "./SongCardSkeleton";

type Props = {
  songs: Song[];
  isLoading: boolean;
};

export default function SearchResults({ songs, isLoading }: Props) {
  return (
    <div className=" grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      {isLoading
        ? Array.from({ length: 10 }).map((_, index) => (
            <SongCardSkeleton key={index} />
          ))
        : songs.map((song) => <SongCard key={song.id} song={song} />)}
    </div>
  );
}
