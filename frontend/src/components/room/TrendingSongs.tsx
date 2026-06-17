import { useEffect, useState } from "react";
import axios from "axios";
import { notify } from "../../utils/notify";

const SAAVAN_DOMAIN = import.meta.env.VITE_JIO_SAAVAN_DOMAIN;

export default function TrendingSongs() {
  const [songs, setSongs] = useState<any[]>([]);
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

      setSongs(playlist.data.data.songs);
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

      <div className="flex gap-4 overflow-x-auto pb-2">
        {isPending ? (
          Array.from({ length: 5 }).map((_, index) => (
            <TrendingSongSkeleton key={index} />
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
          songs.map((song) => (
            <div
              key={song.id}
              className="
          w-45
          shrink-0
          bg-slate-900
          rounded-2xl
          p-3
        "
            >
              <img
                src={song.image[1].url}
                className="
            h-36
            w-full
            rounded-xl
            object-cover
          "
              />

              <h3 className="mt-3 truncate">{song.name}</h3>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function TrendingSongSkeleton() {
  return (
    <div
      className="
        w-45
        shrink-0
        bg-slate-900
        rounded-2xl
        p-3
        animate-pulse
      "
    >
      <div
        className="
          h-36
          w-full
          rounded-xl
          bg-slate-800
        "
      />

      <div
        className="
          mt-3
          h-4
          rounded
          bg-slate-800
        "
      />

      <div
        className="
          mt-2
          h-3
          w-3/4
          rounded
          bg-slate-800
        "
      />
    </div>
  );
}
