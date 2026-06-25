import Events from "../enums/Event";
import type { Song } from "../types/Song";
import sendMessage from "./sendEvent";

const SERVER_DOMAIN = import.meta.env.VITE_API_SERVER_DOMAIN;

export const socket = new WebSocket(`ws://${SERVER_DOMAIN}/ws`);

socket.onopen = () => {
  console.log("Connected");
};

interface JoinRoomReq {
  roomId: string;
  auth0Id: string;
  username: string;
  picture: string;
}

export function joinRoom(req: JoinRoomReq) {
  if (!req.auth0Id) {
    console.log(req);
    console.log("AuthID Required");
    return;
  }

  sendMessage(Events.JoinRoom, {
    auth0Id: req.auth0Id,
    roomId: req.roomId,
    username: req.username,
    picture: req.picture,
  });
}

export function leaveRoom() {
  sendMessage(Events.LeaveRoom, {});
}

export function addSong(song: Song) {
  sendMessage(Events.AddSong, song);
}

interface LikeSongReq {
  isLiked: boolean;
  songId: string;
}

export function likeSong(req: LikeSongReq) {
  sendMessage(Events.SongLiked, req);
}

export function reqNextSong(roomId: string) {
  sendMessage(Events.NextSong, { roomId });
}

export function reqCurrentSong(roomId: string) {
  sendMessage(Events.CurrentSong, { roomId });
}

export function updateMasterTime(req: {
  roomId: string;
  masterTime: {
    currentTime: number;
    date: number;
    duration: number;
  };
}) {
  sendMessage(Events.UpdateMasterTime, req);
}
export function updatePlayState(playing: boolean) {
  sendMessage(Events.UpdatePlayState, { playing });
}

export function clearNowPlaying() {
  sendMessage(Events.ClearNowPlaying, {});
}
