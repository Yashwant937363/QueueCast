import { QrCode, Users, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import QRCodeModal from "./QRCodeModal";

export default function RoomHeader() {
  const currentRoom = useAppSelector((state) => state.rooms.currentRoom);
  const { auth0Id } = useAppSelector((state) => state.user);

  const [showQR, setShowQR] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isOwner = currentRoom?.owner?.auth0Id === auth0Id;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{currentRoom?.name}</h1>
            {currentRoom?.isPrivate && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                <Lock size={12} /> Private
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1.5">
            <p className="text-slate-400 text-sm">
              Room ID: <span className="font-mono text-violet-400 font-medium">{currentRoom?.roomId}</span>
            </p>

            {isOwner && currentRoom?.password && (
              <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-slate-300">
                <span className="text-slate-500 font-medium">Password:</span>
                <span className="font-mono font-semibold text-violet-300">
                  {showPassword ? currentRoom.password : "••••••••"}
                </span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Users size={18} />
            {currentRoom?.clients?.length}/{currentRoom?.limit}
          </div>

          <button
            onClick={() => setShowQR(true)}
            className="
              bg-slate-900
              hover:bg-slate-800
              border border-slate-800
              p-2
              rounded-xl
              transition
              cursor-pointer
            "
          >
            <QrCode size={18} />
          </button>
        </div>
      </div>

      <QRCodeModal
        open={showQR}
        onClose={() => setShowQR(false)}
        roomName={currentRoom?.name}
        roomId={currentRoom?.roomId}
        isPrivate={currentRoom?.isPrivate}
        roomPassword={isOwner ? currentRoom?.password : undefined}
      />
    </>
  );
}
