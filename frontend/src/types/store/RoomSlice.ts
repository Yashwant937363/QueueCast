import type { Room, RoomUser } from "../../types/Room";

export interface OtherRoom {
  name: string;
  owner: RoomUser;
  roomId: string;
  limit: number;
  isPrivate: boolean;
  isMasterOnly: boolean;
}

export interface RoomSlice {
  currentRoom: Room | null;
  publicRooms: OtherRoom[];
  privateRooms: OtherRoom[];
  isCreating: boolean;
}

export interface CreateRoomRequestUser {
  username: string;
  picture: string;
  authToken: string;
}

export interface CreateRoomDetails {
  name: string;
  limit: number;
  isPrivate: boolean;
  isMasterOnly: boolean;
}

export interface CreateRoomRequest {
  user: CreateRoomRequestUser;
  room: CreateRoomDetails;
}
