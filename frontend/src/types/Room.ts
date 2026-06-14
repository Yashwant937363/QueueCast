import type { Song } from "./Song";

export interface Room {
  name: string;
  owner: RoomUser;
  roomId: string;
  limit: number;
  isPrivate: boolean;
  isMasterOnly: boolean;
  songs: Song[];
  clients: RoomUser[];
}

export interface RoomUser {
  auth0Id: string;
  username: string;
  picture?: string;
}
