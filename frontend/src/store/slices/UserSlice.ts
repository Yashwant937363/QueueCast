import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

interface SyncUserReq {
  token: string;
  username: string;
  email: string;
  picture: string;
}

export const syncUser = createAsyncThunk(
  "syncUser",
  async (req: SyncUserReq) => {
    const response = await axios.post(
      `${SERVER_URL}/api/auth/login`,
      {
        username: req.username,
        email: req.email,
        picture: req.picture,
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

interface UserSlice {
  auth0Id: string;
  email: string;
  username: string;
  picture: string;
  isAuthenticated: boolean;
  isPending: boolean;
}

const initialState: UserSlice = {
  auth0Id: "",
  email: "",
  username: "",
  picture: "",
  isPending: false,
  isAuthenticated: false,
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
      }
    });
    builder.addCase(syncUser.rejected, (state) => {
      state.isPending = false;
    });
  },
});

export const { setLoginDetails } = userSlice.actions;
export default userSlice.reducer;
