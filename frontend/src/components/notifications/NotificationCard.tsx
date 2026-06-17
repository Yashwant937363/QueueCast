import { motion } from "motion/react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import {
  type Notification,
  removeNotification,
} from "../../store/slices/NotificationSlice";
import { useAppDispatch } from "../../store/hooks";

type Props = {
  notification: Notification;
};

export default function NotificationCard({ notification }: Props) {
  const dispatch = useAppDispatch();

  const styles = {
    success: {
      icon: CheckCircle,
      border: "border-green-500/30",
      iconColor: "text-green-400",
    },

    error: {
      icon: XCircle,
      border: "border-red-500/30",
      iconColor: "text-red-400",
    },

    warning: {
      icon: AlertTriangle,
      border: "border-yellow-500/30",
      iconColor: "text-yellow-400",
    },

    info: {
      icon: Info,
      border: "border-blue-500/30",
      iconColor: "text-blue-400",
    },
  };

  const config = styles[notification.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        x: 300,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: 300,
      }}
      transition={{
        duration: 0.25,
      }}
      className={`
        w-85
        rounded-2xl
        border
        bg-slate-900/95
        backdrop-blur-xl
        p-4
        shadow-xl
        ${config.border}
      `}
    >
      <div className="flex gap-3">
        <Icon size={22} className={`${config.iconColor} shrink-0 mt-0.5`} />

        <div className="flex-1">
          <h4 className="font-semibold text-white">{notification.title}</h4>

          <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
        </div>

        <button
          onClick={() => dispatch(removeNotification(notification.id))}
          className="
            text-slate-500
            hover:text-white
            cursor-pointer
          "
        >
          <X size={18} />
        </button>
      </div>
    </motion.div>
  );
}
