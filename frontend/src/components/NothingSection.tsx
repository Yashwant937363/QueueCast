import { Ban } from "lucide-react";

export default function NothingSection({ message }: { message: string }) {
  return (
    <div className="h-52 w-full flex justify-center align-items-center text-slate-500 ">
      <div className="flex flex-col justify-center gap-2">
        <span className="flex justify-center ">
          <Ban size={64} />
        </span>
        <span className="text-2xl">{message}</span>
      </div>
    </div>
  );
}
