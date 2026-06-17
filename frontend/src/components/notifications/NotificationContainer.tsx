import { AnimatePresence } from "motion/react";
import { useAppSelector } from "../../store/hooks";
import NotificationCard from "./NotificationCard";

export default function NotificationContainer() {
  const notifications = useAppSelector(
    (state) => state.notifications.notifications,
  );

  return (
    <div
      className="
        fixed
        top-5
        right-5
        z-9999

        flex
        flex-col
        gap-3

        pointer-events-none
      "
    >
      <AnimatePresence>
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationCard notification={notification} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
