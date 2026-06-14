import { Play } from "lucide-react";

export default function MobilePlayerBar() {
  return (
    <div
      className="
        lg:hidden
        fixed
        bottom-0
        left-0
        right-0
        bg-slate-900
        border-t
        border-slate-800
        px-4
        py-3
      "
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">Believer</p>

          <p className="text-xs text-slate-400">Imagine Dragons</p>
        </div>

        <button
          className="
            bg-violet-600
            rounded-full
            p-3
          "
        >
          <Play size={18} />
        </button>
      </div>
    </div>
  );
}
