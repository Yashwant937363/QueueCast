import React, { useEffect } from "react";
import { motion } from "motion/react";
import CreateRoom from "../components/Rooms/CreateRoom";
import JoinRoom from "../components/Rooms/JoinRoom";
import RecentRooms from "../components/Rooms/RecentRooms";
import PublicRooms from "../components/Rooms/PublicRooms";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppDispatch } from "../store/hooks";
import { getRooms } from "../store/slices/RoomsSlice";
import { Lock } from "lucide-react";

const Rooms: React.FC = () => {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchRooms = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: "https://queuecast-api",
            },
          });
          dispatch(getRooms(token));
        } catch (err) {
          console.error("Failed to fetch access token for rooms:", err);
        }
      }
    };
    fetchRooms();
  }, [isAuthenticated, dispatch, getAccessTokenSilently]);

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 max-w-md w-full shadow-2xl flex flex-col items-center space-y-6">
          <div className="p-4 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <Lock size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Authentication Required</h2>
            <p className="text-slate-400 text-sm mt-2">
              Please log in to view active public rooms or create your own room.
            </p>
          </div>
          <button
            onClick={() => loginWithRedirect()}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 font-semibold rounded-xl transition cursor-pointer"
          >
            Log In to Access Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Rooms</h1>

          <p className="text-slate-400 mt-2">
            Create a room or join an existing one.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1px_1fr] gap-8">
          {/* LEFT SECTION */}
          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="lg:col-span-1 space-y-6"
          >
            {/* CREATE ROOM */}
            <CreateRoom />
            {/* JOIN ROOM */}
            <JoinRoom />
          </motion.div>
          <div className="hidden lg:block w-px bg-linear-to-b from-transparent via-slate-700 to-transparent" />
          {/* RIGHT SECTION */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6">
            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="space-y-8 lg:col-span-1 pt-1"
            >
              {/* RECENT ROOMS */}
              <RecentRooms />

              {/* PUBLIC ROOMS */}
              <PublicRooms />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
