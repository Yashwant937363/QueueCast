import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import SearchTabs from "./SearchTabs";
import TrendingSongs from "./TrendingSongs";
import SearchResults from "./SearchResults";
import useDebounce from "../../hooks/useDebounce";
import type { Song } from "../../types/Song";
import type { JioSaavnSong } from "../../types/JioSaavnSong";
import type { YoutubeVideo } from "../../types/YoutubeVideo";
import { decode } from "he";

const SAAVAN_DOMAIN = import.meta.env.VITE_JIO_SAAVAN_DOMAIN;

export default function SearchPanel() {
  const [query, setQuery] = useState("");

  const [tab, setTab] = useState<"jiosaavn" | "youtube">("jiosaavn");

  const debouncedQuery = useDebounce(query, 500);

  const isSearching = debouncedQuery.trim().length > 0;

  const [jioSaavnSongs, setJioSaavnSongs] = useState<Song[]>([]);
  const [youtubeSongs, setYoutubeSongs] = useState<Song[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  const searchJioSaavnSongs = async () => {
    try {
      const response = await fetch(
        `${SAAVAN_DOMAIN}/api/search/songs?query=${encodeURIComponent(query)}`,
      );

      const data = await response.json();
      if (response.status == 200) {
        console.log("JioSaavn Data: ", data.data.results);
        console.log("JioSaavn Length:", data.data.results.length);

        const songs = data.data.results.map((song: JioSaavnSong) => ({
          id: song.id,
          likes: 0,
          name: decode(song.name),
          picture: song.image[song.image.length - 2].url,
          source: "jiosaavn" as const,
          url: song.downloadUrl[song.downloadUrl.length - 1].url,
        }));

        setJioSaavnSongs(songs);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const searchYoutubeSongs = async () => {
    if (!query.trim()) return;

    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
          query,
        )}&key=${apiKey}`,
      );

      const data = await response.json();
      if (response.status == 200) {
        console.log("Youtube Data: ", data.items);
        console.log("Youtube Length:", data.items.length);
        const videos = data.items.map((video: YoutubeVideo) => ({
          id: video.id.videoId,
          likes: 0,
          name: decode(video.snippet.title),
          picture: video.snippet.thumbnails.medium.url,
          source: "youtube" as const,
          url: video.id.videoId,
        }));

        setYoutubeSongs(videos);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!debouncedQuery) return;
    const searchSongs = async () => {
      setLoading(true);
      await searchYoutubeSongs();
      await searchJioSaavnSongs();
      setLoading(false);
    };
    searchSongs();
  }, [debouncedQuery]);

  useEffect(() => {
    console.log("Youtube: ", youtubeSongs);
    console.log("JioSaavn: ", jioSaavnSongs);
  }, [jioSaavnSongs, youtubeSongs]);

  return (
    <div className="flex flex-col gap-8 lg:block w-full min-w-0">
      <SearchBar value={query} onChange={setQuery} />

      {isSearching && <SearchTabs tab={tab} setTab={setTab} />}

      {!isSearching ? (
        <TrendingSongs />
      ) : (
        <SearchResults
          songs={tab == "jiosaavn" ? jioSaavnSongs : youtubeSongs}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
