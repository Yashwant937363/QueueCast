import type { Events } from "../enums/Event";
import { socket } from "./socket";

export default function sendMessage(event: Events, message: unknown) {
  if (socket.readyState !== WebSocket.OPEN) {
    console.log("Socket not connected");
    return;
  }

  socket.send(
    JSON.stringify({
      event,
      message,
    }),
  );
}
