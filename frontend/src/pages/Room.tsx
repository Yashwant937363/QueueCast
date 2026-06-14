import React, { useEffect } from "react";
import { useParams } from "react-router";
import { useAppSelector } from "../store/hooks";
import { joinRoom } from "../socket/socket";

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentRoom } = useAppSelector((state) => state.rooms);
  const { isAuthenticated, auth0Id, username, picture } = useAppSelector(
    (state) => state.user,
  );

  useEffect(() => {
    if (roomId && currentRoom?.roomId !== roomId) {
      if (isAuthenticated) {
        joinRoom({
          auth0Id,
          picture,
          roomId,
          username,
        });
      }
    }
  }, [roomId]);

  return (
    <>
      <div>Room ID: {roomId}</div>
      <div>Connected: (connected)</div>
      <div></div>
    </>
  );
};

export default Room;
