import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RoomSlice } from "../../types/store/RoomSlice";
import type { Room, RoomUser } from "../../types/Room";

const initialState: RoomSlice = {
  currentRoom: null,
  publicRooms: [],
  privateRooms: [],
  isCreating: false,
};

const roomSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    setCurrentRoom: (state, action: PayloadAction<{ room: Room }>) => {
      state.currentRoom = action.payload.room;
    },
    addClient: (state, action: PayloadAction<{ client: RoomUser }>) => {
      if (!state.currentRoom) return;

      const exists = state.currentRoom.clients.some(
        (client) => client.auth0Id === action.payload.client.auth0Id,
      );

      if (!exists) {
        state.currentRoom.clients.push(action.payload.client);
      }
    },

    leftClient: (state, action: PayloadAction<{ auth0Id: string }>) => {
      if (!state.currentRoom) return;

      state.currentRoom.clients = state.currentRoom.clients.filter(
        (client) => client.auth0Id !== action.payload.auth0Id,
      );
    },
  },
});

export const { setCurrentRoom, addClient, leftClient } = roomSlice.actions;
export default roomSlice.reducer;
