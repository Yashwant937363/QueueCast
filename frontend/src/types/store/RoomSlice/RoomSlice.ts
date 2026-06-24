import type { NowPlaying } from "../../NowPlaying";
import type { Room } from "../../Room";

export interface CurrentRoom extends Room {
  nowPlaying: NowPlaying | null;
}

export interface RoomSlice {
  currentRoom: CurrentRoom | null;
  publicRooms: Room[];
  privateRooms: Room[];
  isCreating: boolean;
  waitingSongs: string[];
}
