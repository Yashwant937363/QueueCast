import React, { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router";
import { createRoom, joinRoom, socket } from "../socket/socket";

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const [connected, setConnected] = useState(false);
  const [admin, setAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!location.state?.isConnected && roomId) {
      joinRoom(roomId);
    } else {
      setConnected(true);
      setAdmin(true);
    }
  }, []);

  return (
    <>
      <div>Room ID: {roomId}</div>
      <div>Connected: (connected)</div>
      <div></div>
    </>
  );
};

export default Room;
