import { useState } from "react";

interface Song {
  id: string;
  name: string;
  image: {
    quality: string;
    url: string;
  }[];
  downloadUrl: {
    quality: string;
    url: string;
  }[];
  primaryArtists: string;
}

export default function JioSaavan() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);

  const searchSongs = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(
        `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(
          query,
        )}`,
      );

      const data = await response.json();

      setSongs(data.data.results || []);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
  };

  const getImage = (song: Song) => {
    return song.image[song.image.length - 1]?.url;
  };

  const getAudio = (song: Song) => {
    return song.downloadUrl[song.downloadUrl.length - 1]?.url;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl p-6">
        <h1 className="mb-6 text-4xl font-bold">Music Search</h1>

        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchSongs()}
            placeholder="Search songs..."
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 p-4 outline-none"
          />

          <button
            onClick={searchSongs}
            className="rounded-xl bg-green-600 px-6 py-4 font-medium hover:bg-green-500"
          >
            Search
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
          {/* Song List */}
          <div className="rounded-2xl bg-zinc-900 p-4">
            <h2 className="mb-4 text-xl font-semibold">Results</h2>

            {loading && <p>Searching...</p>}

            <div className="space-y-3">
              {songs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-zinc-800"
                >
                  <img
                    src={getImage(song)}
                    alt={song.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  <div>
                    <p className="font-medium">{song.name}</p>

                    <p className="text-sm text-zinc-400">
                      {song.primaryArtists}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player */}
          <div className="rounded-2xl bg-zinc-900 p-6">
            {currentSong ? (
              <>
                <img
                  src={getImage(currentSong)}
                  alt={currentSong.name}
                  className="mx-auto h-72 w-72 rounded-2xl object-cover"
                />

                <h2 className="mt-6 text-center text-3xl font-bold">
                  {currentSong.name}
                </h2>

                <p className="mt-2 text-center text-zinc-400">
                  {currentSong.primaryArtists}
                </p>

                <audio
                  key={currentSong.id}
                  controls
                  autoPlay
                  className="mt-8 w-full"
                >
                  <source src={getAudio(currentSong)} type="audio/mpeg" />
                </audio>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                Search and select a song
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
