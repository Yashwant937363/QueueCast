import { useEffect, useState } from "react";
import axios from "axios";
import { notify } from "../../utils/notify";
import SongCard from "./SongCard";
import type { Song } from "../../types/Song";
import type { JioSaavnSong } from "../../types/JioSaavnSong";
import { decode } from "he";
import { SongCardSkeleton } from "./SongCardSkeleton";

const SAAVAN_DOMAIN = import.meta.env.VITE_JIO_SAAVAN_DOMAIN;

export default function TrendingSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const getSongs = async () => {
    try {
      setPending(true);
      setError(false);

      const response = await axios.get(
        `${SAAVAN_DOMAIN}/api/search/playlists?query=Now Trending&page=0&limit=4`,
      );

      const playlist = await axios.get(
        `${SAAVAN_DOMAIN}/api/playlists?id=${response.data.data.results[1].id}`,
      );

      const treandingSongs = playlist.data.data.songs.map(
        (song: JioSaavnSong) => ({
          id: song.id,
          likes: 0,
          name: decode(song.name),
          picture: song.image[song.image.length - 2].url,
          source: "jiosaavn" as const,
          url: song.downloadUrl[song.downloadUrl.length - 1].url,
        }),
      );

      setSongs(treandingSongs);
    } catch (err) {
      console.error(err);

      setSongs([]);
      setError(true);

      notify(
        "error",
        "Failed To Load Trending Songs",
        "Please check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  };
  useEffect(() => {
    getSongs();
  }, []);

  return (
    <>
      <h2 className="font-semibold text-xl lg:mt-8  lg:mb-4">
        🔥 Trending Today
      </h2>

      <div className="space-y-3 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {isPending ? (
          Array.from({ length: 10 }).map((_, index) => (
            <SongCardSkeleton key={index} />
          ))
        ) : error ? (
          <div
            className="
        w-full
        rounded-2xl
        border
        border-red-500/20
        bg-slate-900
        p-8
        text-center
      "
          >
            <h3 className="font-semibold text-lg">Unable to load songs</h3>

            <p className="mt-2 text-slate-400">
              Something went wrong while fetching trending songs.
            </p>

            <button
              onClick={getSongs}
              className="
          mt-4
          rounded-xl
          bg-violet-600
          px-4
          py-2
          hover:bg-violet-700
          transition
          cursor-pointer
        "
            >
              Reload
            </button>
          </div>
        ) : songs.length === 0 ? (
          <div
            className="
        w-full
        rounded-2xl
        bg-slate-900
        p-8
        text-center
        text-slate-400
      "
          >
            No songs available.
          </div>
        ) : (
          songs.map((song) => <SongCard key={song.id} song={song} />)
        )}
      </div>
    </>
  );
}
