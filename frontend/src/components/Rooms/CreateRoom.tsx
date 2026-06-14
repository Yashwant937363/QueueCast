import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { useAuth0 } from "@auth0/auth0-react";
import { joinRoom } from "../../socket/socket";
import axios from "axios";
import { useNavigate } from "react-router";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const constructApiUrl = (endpoint: string): string =>
  `${SERVER_URL}/api/room${endpoint}`;

const CreateRoom: React.FC = () => {
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [userLimit, setUserLimit] = useState(20);
  const [playbackMode, setPlaybackMode] = useState("master");
  const { auth0Id, picture, username } = useAppSelector((state) => state.user);
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: "https://queuecast-api",
      },
    });

    const response = await axios.post(
      constructApiUrl(""),
      {
        user: {
          name: username,
          picture,
        },
        room: {
          isMasterOnly: playbackMode === "master",
          isPrivate,
          limit: userLimit,
          name: roomName,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!(response.status >= 200 && response.status < 300)) {
      alert("Room Creation Failed");
      return;
    }
    const roomId = response.data.roomId;

    joinRoom({
      auth0Id,
      picture,
      roomId,
      username,
    });

    navigate(`/room/${roomId}`);
  };

  return (
    <div
      className="
                bg-slate-900
                border
                border-slate-800
                rounded-3xl
                p-6
              "
    >
      <div className="flex items-center gap-2 mb-6">
        <Plus className="text-violet-500" size={20} />
        <h2 className="text-xl font-semibold">Create Room</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block mb-2 text-sm text-slate-400">Room Name</label>

          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Weekend Party"
            className="
                      w-full
                      bg-slate-800
                      border
                      border-slate-700
                      rounded-xl
                      px-4
                      py-3
                      outline-none
                      focus:border-violet-500
                    "
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-slate-400">
            Room Visibility
          </label>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!isPrivate}
                onChange={() => setIsPrivate(false)}
              />
              Public
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={isPrivate}
                onChange={() => setIsPrivate(true)}
              />
              Private
            </label>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm text-slate-400">
            User Limit
          </label>

          <select
            value={userLimit}
            onChange={(e) => setUserLimit(Number(e.target.value))}
            className="
                      w-full
                      bg-slate-800
                      border
                      border-slate-700
                      rounded-xl
                      px-4
                      py-3
                    "
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm text-slate-400">
            Playback Mode
          </label>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={playbackMode === "master"}
                onChange={() => setPlaybackMode("master")}
              />
              Host Device Only
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={playbackMode === "all"}
                onChange={() => setPlaybackMode("all")}
              />
              All Devices
            </label>
          </div>
        </div>

        <motion.button
          onClick={handleCreateRoom}
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
          className="
                    w-full
                    bg-violet-600
                    hover:bg-violet-700
                    py-3
                    rounded-xl
                    font-semibold
                  "
        >
          Create Room
        </motion.button>
      </div>
    </div>
  );
};

export default CreateRoom;
