import QueueCard from "./QueueCard";
import type { QueueSong } from "../../types/music";

const queue: QueueSong[] = [
  {
    id: "1",
    title: "Believer",
    artist: "Imagine Dragons",
    image: "https://picsum.photos/300?1",
    votes: 24,
    source: "jiosaavn",
    position: 1,
  },
  {
    id: "2",
    title: "Heat Waves",
    artist: "Glass Animals",
    image: "https://picsum.photos/300?2",
    votes: 19,
    source: "jiosaavn",
    position: 2,
  },
  {
    id: "3",
    title: "Starboy",
    artist: "The Weeknd",
    image: "https://picsum.photos/300?3",
    votes: 17,
    source: "youtube",
    position: 3,
  },
];

export default function QueueList() {
  return (
    <div
      className="
        bg-slate-900
        border border-slate-800
        rounded-3xl
        p-5
        flex
        flex-col
      "
    >
      <h2 className="text-xl font-semibold mb-4">Queue</h2>

      <div
        className="
          space-y-3
          overflow-y-auto
          max-h-125
        "
      >
        {queue.map((song) => (
          <QueueCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}
