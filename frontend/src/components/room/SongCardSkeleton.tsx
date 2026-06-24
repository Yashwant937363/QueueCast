export function SongCardSkeleton() {
  return (
    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-3
        flex
        justify-between
flex-col
gap-2
h-full
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
