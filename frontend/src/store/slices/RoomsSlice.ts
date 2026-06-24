import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Room, RoomUser } from "../../types/Room";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { Song } from "../../types/Song";
import type { RoomSlice } from "../../types/store/RoomSlice/RoomSlice";
import type { SetSongLiked } from "../../types/store/RoomSlice/SetSongLiked";
import type SetSongLikes from "../../types/store/RoomSlice/SetSongLikes";
import type { NowPlaying } from "../../types/NowPlaying";

let count = 0;

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const getRooms = createAsyncThunk(
  "rooms/getRooms",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get<{ rooms: Room[] }>(
        `${SERVER_URL}/api/rooms`,
      );

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
  waitingSongs: [],
};

const roomSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    setCurrentRoom: (state, action: PayloadAction<{ room: Room }>) => {
      state.currentRoom = {
        ...action.payload.room,
        nowPlaying: null,
      };
    },
    addClient: (state, action: PayloadAction<{ client: RoomUser }>) => {
      if (!state.currentRoom) return;

      const exists = state.currentRoom.clients.some(
        (client) => client.auth0Id === action.payload.client.auth0Id,
      );

      if (!exists) {
        state.currentRoom.clients = [
          ...state.currentRoom.clients,
          action.payload.client,
        ];
      }
    },

    leftClient: (state, action: PayloadAction<{ auth0Id: string }>) => {
      if (!state.currentRoom) return;

      state.currentRoom.clients = state.currentRoom.clients.filter(
        (client) => client.auth0Id !== action.payload.auth0Id,
      );
    },
    addSong: (state, action: PayloadAction<Song>) => {
      if (!state.currentRoom) return;

      const exists = state.currentRoom.songs.some(
        (song) => song.id === action.payload.id,
      );

      if (!exists) {
        state.currentRoom.songs = [...state.currentRoom.songs, action.payload];
      }
      state.waitingSongs = state.waitingSongs.filter(
        (songId) => songId !== action.payload.id,
      );
    },
    removeSongFromRoom: (state, action: PayloadAction<Song>) => {
      if (state.currentRoom) {
        state.currentRoom.songs = state.currentRoom.songs.filter(
          (song) => song.id !== action.payload.id,
        );
      }
    },
    addSongToRoom: (state, action: PayloadAction<string>) => {
      state.waitingSongs = [...state.waitingSongs, action.payload];
    },
    removeSongFromWaiting: (state, action: PayloadAction<string>) => {
      state.waitingSongs = state.waitingSongs.filter(
        (songId) => songId !== action.payload,
      );
    },
    setSongLiked: (state, action: PayloadAction<SetSongLiked>) => {
      if (state.currentRoom && state.currentRoom.songs) {
        state.currentRoom.songs = state.currentRoom.songs.map((song: Song) => {
          if (song.id == action.payload.songId) {
            song.isLiked = action.payload.isLiked;
          }
          return song;
        });
      }
    },
    setSongLikes: (state, action: PayloadAction<SetSongLikes>) => {
      if (state.currentRoom && state.currentRoom.songs) {
        state.currentRoom.songs = state.currentRoom.songs.map((song: Song) => {
          if (song.id == action.payload.songId) {
            song.likes = action.payload.likes;
          }
          return song;
        });
      }
    },
    addNewRoom: (state, action: PayloadAction<Room>) => {
      if (action.payload.isPrivate) {
        state.privateRooms = [...state.privateRooms, action.payload];
      } else {
        state.publicRooms = [...state.publicRooms, action.payload];
      }
    },
    setCurrentPlaying: (state, action: PayloadAction<NowPlaying | null>) => {
      if (state.currentRoom) {
        state.currentRoom.nowPlaying = action.payload;
        // state.currentRoom.songs = state.currentRoom.songs.filter(
        //   (song) => song.id !== action.payload.id,
        // );
      }
    },
    setMasterTime: (
      state,
      action: PayloadAction<{
        date: number;
        currentTime: number;
        duration: number;
      }>,
    ) => {
      if (state.currentRoom?.nowPlaying) {
        console.log(count++);
        state.currentRoom.nowPlaying.masterTime = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRooms.pending, () => {})
      .addCase(getRooms.fulfilled, (state, action) => {
        state.publicRooms = action.payload.filter((room) => !room.isPrivate);
        state.privateRooms = action.payload.filter((room) => room.isPrivate);
      })
      .addCase(getRooms.rejected, (_, action) => {
        console.log("Error:", action.payload);
      });
  },
});

export const {
  setCurrentRoom,
  addClient,
  leftClient,
  addSong,
  addSongToRoom,
  removeSongFromRoom,
  removeSongFromWaiting,
  setSongLiked,
  setSongLikes,
  addNewRoom,
  setCurrentPlaying,
  setMasterTime,
} = roomSlice.actions;
export default roomSlice.reducer;
