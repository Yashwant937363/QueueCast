import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/UserSlice";
import roomSlice from "./slices/RoomsSlice";
import notificationSlice from "./slices/NotificationSlice";
import playerSlice from "./slices/PlayerSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    rooms: roomSlice,
    notifications: notificationSlice,
    player: playerSlice,
  },
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
