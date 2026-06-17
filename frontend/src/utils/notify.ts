import { store } from "../store/store";
import {
  addNotification,
  removeNotification,
} from "../store/slices/NotificationSlice";

export const notify = (
  type: "success" | "error" | "warning" | "info",
  title: string,
  message: string,
) => {
  const id = crypto.randomUUID();

  store.dispatch(
    addNotification({
      id,
      type,
      title,
      message,
    }),
  );

  setTimeout(() => {
    store.dispatch(removeNotification(id));
  }, 4000);
};
