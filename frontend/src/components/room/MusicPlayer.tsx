import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useState } from "react";

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(true);

  return (
    <div
      className="
    bg-slate-900
    border
    border-slate-800
    rounded-3xl
    p-6

    lg:sticky
    lg:top-24
  "
    >
      <img
        src="https://picsum.photos/500"
        alt="cover"
        className="
    w-full
    aspect-square
    object-cover
    rounded-2xl
  "
      />

      <div className="mt-6 text-center">
        <h2 className="text-2xl font-bold">Believer</h2>

        <p className="text-slate-400">Imagine Dragons</p>
      </div>

      {/* Progress */}

      <div className="mt-6">
        <div className="h-2 bg-slate-800 rounded-full">
          <div className="h-full w-1/3 bg-violet-500 rounded-full" />
        </div>

        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>1:24</span>
          <span>3:56</span>
        </div>
      </div>

      {/* Controls */}

      <div className="flex justify-center items-center gap-6 mt-8">
        <button className="cursor-pointer">
          <SkipBack />
        </button>

        <button
          onClick={() => setPlaying(!playing)}
          className="
            w-14
            h-14
            rounded-full
            bg-violet-600
            flex
            items-center
            justify-center
            cursor-pointer
          "
        >
          {playing ? <Pause /> : <Play />}
        </button>

        <button className="cursor-pointer">
          <SkipForward />
        </button>
      </div>
    </div>
  );
}
