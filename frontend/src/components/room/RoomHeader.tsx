import { QrCode, Users } from "lucide-react";
import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import QRCodeModal from "./QRCodeModal";

export default function RoomHeader() {
  const currentRoom = useAppSelector((state) => state.rooms.currentRoom);

  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{currentRoom?.name}</h1>

          <p className="text-slate-400">Room ID: {currentRoom?.roomId}</p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Users size={18} />
            {currentRoom?.clients.length}/{currentRoom?.limit}
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
      />
    </>
  );
}
