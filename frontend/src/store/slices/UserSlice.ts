import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type SyncUserReq from "../../types/store/UserSlice/SyncUserReq";
import type UserSlice from "../../types/store/UserSlice/UserSlice";
import { getOrInitGuestUser, updateGuestUsername } from "../../utils/guestUser";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const syncUser = createAsyncThunk(
  "syncUser",
  async (req: SyncUserReq) => {
    const response = await axios.post(
      `${SERVER_URL}/api/auth/login`,
      {
        username: req.username,
        email: req.email,
        picture: req.picture,
        prevGuestId: req.prevGuestId,
      },
      {
        headers: {
          Authorization: `Bearer ${req.token}`,
        },
      },
    );
    return {
      status: response.status,
      data: response.data,
      user: {
        username: req.username,
        email: req.email,
        picture: req.picture,
      },
    };
  },
);

const initialState: UserSlice = {
  auth0Id: "",
  email: "",
  username: "",
  picture: "",
  isPending: false,
  isAuthenticated: false,
  isGuest: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoginDetails: (state, action) => {
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.picture = action.payload.picture;
    },
    initGuestUser: (state) => {
      if (!state.isAuthenticated) {
        const guest = getOrInitGuestUser();
        state.auth0Id = guest.guestId;
        state.username = guest.username;
        state.picture = guest.picture;
        state.isGuest = true;
      }
    },
    updateGuestName: (state, action: PayloadAction<string>) => {
      if (state.isGuest) {
        const updated = updateGuestUsername(action.payload);
        state.username = updated.username;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(syncUser.pending, (state) => {
      state.isPending = true;
    });
    builder.addCase(syncUser.fulfilled, (state, action) => {
      state.isPending = false;
      const { status, data, user } = action.payload;
      if (status >= 200 && status < 300) {
        state.auth0Id = data.auth0Id;
        state.email = user.email;
        state.username = user.username;
        state.picture = user.picture;
        state.isAuthenticated = true;
        state.isGuest = false;
      }
    });
    builder.addCase(syncUser.rejected, (state) => {
      state.isPending = false;
    });
  },
});

export const { setLoginDetails, initGuestUser, updateGuestName } = userSlice.actions;
export default userSlice.reducer;
