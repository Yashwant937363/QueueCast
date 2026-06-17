import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RoomSlice } from "../../types/store/RoomSlice";
import type { Room, RoomUser } from "../../types/Room";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const getRooms = createAsyncThunk(
  "rooms/getRooms",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get<{ rooms: Room[] }>(
        `${SERVER_URL}/api/rooms`,
      );

      console.log("Rooms:", response.data.rooms);

      return response.data.rooms;
    } catch (error) {
      console.error(error);
      return thunkAPI.rejectWithValue("Failed to fetch rooms");
    }
  },
);

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
  extraReducers: (builder) => {
    builder
      .addCase(getRooms.pending, () => {
        console.log("Loading rooms...");
      })
      .addCase(getRooms.fulfilled, (state, action) => {
        state.publicRooms = action.payload.filter((room) => !room.isPrivate);
        state.privateRooms = action.payload.filter((room) => room.isPrivate);
      })
      .addCase(getRooms.rejected, (_, action) => {
        console.log("Error:", action.payload);
      });
  },
});

export const { setCurrentRoom, addClient, leftClient } = roomSlice.actions;
export default roomSlice.reducer;
