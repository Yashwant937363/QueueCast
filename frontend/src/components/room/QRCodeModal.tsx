import { motion, AnimatePresence } from "motion/react";
import { X, Download, Share2, Copy } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import { notify } from "../../utils/notify";

type Props = {
  open: boolean;
  onClose: () => void;
  roomName?: string;
};

export default function QRCodeModal({ open, onClose, roomName }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);

  const roomUrl = window.location.href;

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");

    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const link = document.createElement("a");

    link.href = pngUrl;
    link.download = `${roomName ?? "queuecast-room"}-qr.png`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    notify("info", "Downloaded", "QR Code Image Downloaded");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(roomUrl);
    notify("info", "Copied", "Room link copied to clipboard");
  };

  const shareRoom = async () => {
    if (!navigator.share) {
      copyLink();
      return;
    }

    try {
      await navigator.share({
        title: roomName || "QueueCast Room",
        text: "Join my QueueCast room 🎵",
        url: roomUrl,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="
              fixed
              inset-0
              bg-black/70
              backdrop-blur-sm
              z-50
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="
              fixed
              top-1/2
              left-1/2
              -translate-x-1/2
              -translate-y-1/2
              z-50
              bg-slate-900
              border
              border-slate-800
              rounded-3xl
              p-6
              w-[90%]
              max-w-md
            "
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
            }}
          >
            {/* Header */}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Share Room</h2>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* QR */}

            <div className="flex flex-col items-center">
              <div
                ref={qrRef}
                className="
                  bg-white
                  rounded-2xl
                  p-4
                "
              >
                <QRCodeCanvas value={roomUrl} size={220} />
              </div>

              <h3 className="mt-4 font-semibold">{roomName}</h3>

              <p className="text-sm text-slate-400 text-center mt-2">
                Scan to join this room instantly
              </p>

              <div
                className="
                  mt-4
                  w-full
                  bg-slate-800
                  rounded-xl
                  p-3
                  text-xs
                  text-slate-300
                  break-all
                "
              >
                {roomUrl}
              </div>
            </div>

            {/* Actions */}

            <div className="grid grid-cols-3 gap-3 mt-6">
              <button
                onClick={copyLink}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  py-3
                  rounded-xl
                  bg-slate-800
                  hover:bg-slate-700
                "
              >
                <Copy size={16} />
                Copy
              </button>

              <button
                onClick={shareRoom}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  py-3
                  rounded-xl
                  bg-violet-600
                  hover:bg-violet-700
                "
              >
                <Share2 size={16} />
                Share
              </button>

              <button
                onClick={downloadQR}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  py-3
                  rounded-xl
                  bg-slate-800
                  hover:bg-slate-700
                "
              >
                <Download size={16} />
                Save
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
