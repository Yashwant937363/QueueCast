import React from "react";
import { motion } from "motion/react";
import CreateRoom from "../components/Rooms/CreateRoom";
import JoinRoom from "../components/Rooms/JoinRoom";
import RecentRooms from "../components/Rooms/RecentRooms";
import PublicRooms from "../components/Rooms/PublicRooms";

const Rooms: React.FC = () => {
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
