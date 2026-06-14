import { trendingSongs } from "../../data/dummySongs";

export default function TrendingSongs() {
  return (
    <>
      <h2 className="font-semibold text-xl mb-4">🔥 Trending Today</h2>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {trendingSongs.map((song) => (
          <div
            key={song.id}
            className="
              min-w-45
              bg-slate-900
              rounded-2xl
              p-3
            "
          >
            <img
              src={song.image}
              className="
                h-36
                w-full
                rounded-xl
                object-cover
              "
            />

            <h3 className="mt-3">{song.title}</h3>
          </div>
        ))}
      </div>
    </>
  );
}
