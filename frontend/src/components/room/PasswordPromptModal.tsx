import { motion, AnimatePresence } from "motion/react";
import { X, Lock, KeyRound, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  roomName?: string;
  error?: string;
};

export default function PasswordPromptModal({
  open,
  onClose,
  onConfirm,
  roomName,
  error,
}: Props) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onConfirm(password.trim());
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
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
              shadow-2xl
            "
            initial={{ opacity: 0, scale: 0.9, y: "-45%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: "-45%" }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5 text-violet-400">
                <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">Private Room</h2>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-5">
              Enter password to join <span className="font-semibold text-slate-200">{roomName || "this room"}</span>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Room Password
                </label>
                <div className="relative flex items-center">
                  <KeyRound size={18} className="absolute left-3.5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter room password"
                    autoFocus
                    className="
                      w-full
                      bg-slate-800
                      border
                      border-slate-700
                      rounded-xl
                      pl-10
                      pr-10
                      py-3
                      text-sm
                      outline-none
                      focus:border-violet-500
                      transition
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 font-medium">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    flex-1
                    py-3
                    rounded-xl
                    bg-slate-800
                    hover:bg-slate-700
                    font-medium
                    transition
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!password.trim()}
                  className="
                    flex-1
                    py-3
                    rounded-xl
                    bg-violet-600
                    hover:bg-violet-700
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    font-medium
                    transition
                  "
                >
                  Join Room
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
