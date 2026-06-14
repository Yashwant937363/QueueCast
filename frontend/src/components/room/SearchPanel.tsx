import { useMemo, useState } from "react";
import SearchBar from "./SearchBar";
import SearchTabs from "./SearchTabs";
import TrendingSongs from "./TrendingSongs";
import SearchResults from "./SearchResults";
import useDebounce from "../../hooks/useDebounce";
import { trendingSongs } from "../../data/dummySongs";

export default function SearchPanel() {
  const [query, setQuery] = useState("");

  const [tab, setTab] = useState<"jiosaavn" | "youtube">("jiosaavn");

  const debouncedQuery = useDebounce(query, 500);

  const isSearching = debouncedQuery.trim().length > 0;

  const filteredSongs = useMemo(() => {
    if (!debouncedQuery) return [];

    return trendingSongs.filter((song) =>
      song.title.toLowerCase().includes(debouncedQuery.toLowerCase()),
    );
  }, [debouncedQuery]);

  return (
    <div className="space-y-6">
      <SearchBar value={query} onChange={setQuery} />

      {isSearching && <SearchTabs tab={tab} setTab={setTab} />}

      {!isSearching ? (
        <TrendingSongs />
      ) : (
        <SearchResults songs={filteredSongs} />
      )}
    </div>
  );
}
