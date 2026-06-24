type Props = {
  tab: "jiosaavn" | "youtube";
  setTab: (tab: "jiosaavn" | "youtube") => void;
};

export default function SearchTabs({ tab, setTab }: Props) {
  return (
    <div className="flex gap-3 mb-5 lg:mt-8">
      <button
        onClick={() => setTab("jiosaavn")}
        className={`px-4 py-2 rounded-xl ${
          tab === "jiosaavn" ? "bg-violet-600" : "bg-slate-900"
        }`}
      >
        JioSaavn
      </button>

      <button
        onClick={() => setTab("youtube")}
        className={`px-4 py-2 rounded-xl ${
          tab === "youtube" ? "bg-violet-600" : "bg-slate-900"
        }`}
      >
        YouTube
      </button>
    </div>
  );
}
