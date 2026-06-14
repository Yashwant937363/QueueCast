import { createSlice } from "@reduxjs/toolkit";
import type { RoomSlice } from "../../types/store/RoomSlice";

const initialState: RoomSlice = {
  currentRoom: null,
  publicRooms: [],
  privateRooms: [],
  isCreating: false,
};

const roomSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {},
});

export default roomSlice.reducer;
