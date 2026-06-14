import Events from "../enums/Event";

const SERVER_DOMAIN = import.meta.env.VITE_API_SERVER_DOMAIN;
console.log(SERVER_DOMAIN);

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
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        event: Events.JoinRoom,
        message: {
          auth0Id: req.auth0Id,
          roomId: req.roomId,
          username: req.username,
          picture: req.picture,
        },
      }),
    );
  } else {
    console.log("Socket not connected");
  }
}
