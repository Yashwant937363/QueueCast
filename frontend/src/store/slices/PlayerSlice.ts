import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type PlayerSlice from "../../types/store/PlayerSlice/PlayerSlice";

const initialState: PlayerSlice = {
  playing: false,
  isLoading: false,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayingState: (state, action: PayloadAction<boolean>) => {
      state.playing = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setPlayingState, setLoading } = playerSlice.actions;
export default playerSlice.reducer;
