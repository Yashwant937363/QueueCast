import Events from "../enums/Event";

const SERVER_DOMAIN = import.meta.env.VITE_API_SERVER_DOMAIN;
console.log(SERVER_DOMAIN);

export const socket = new WebSocket(`ws://${SERVER_DOMAIN}/ws`);

socket.onopen = () => {
  console.log("Connected");
};

export function createRoom(email: string) {
  socket.send(JSON.stringify({ event: Events.CreateRoom, message: { email } }));
}
export function joinRoom(roomId: string) {}
