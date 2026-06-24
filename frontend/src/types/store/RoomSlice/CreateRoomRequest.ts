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
