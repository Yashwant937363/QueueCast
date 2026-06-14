import { useAuth0 } from "@auth0/auth0-react";
import { Music, Users, Heart, Play, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import HeroMusicFlow from "../components/Home/HeroMusicFlow";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const [songs, setSongs] = useState([
    { id: 1, name: "Believer", votes: 25 },
    { id: 2, name: "Heat Waves", votes: 20 },
    { id: 3, name: "Animals", votes: 18 },
    { id: 4, name: "Blinding Lights", votes: 15 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSongs((prev) =>
        [...prev]
          .map((song) => ({
            ...song,
            votes: song.votes + Math.floor(Math.random() * 3),
          }))
          .sort((a, b) => b.votes - a.votes),
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 blur-3xl rounded-full" />

      {/* Navbar */}

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-20 overflow-hidden">
        <HeroMusicFlow />
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 mb-6">
              <Music size={16} />
              Real-Time Collaborative Music
            </div>

            <div className="relative">
              <div className="absolute -inset-10 bg-violet-600/10 blur-3xl rounded-full" />

              <h1 className="relative text-5xl md:text-7xl font-bold leading-tight">
                The Playlist
                <br />
                <span className="text-violet-500">Everyone Controls</span>
              </h1>
            </div>

            <p className="text-slate-400 text-lg mt-6 max-w-xl">
              Create rooms, invite friends, add songs, vote together, and let
              the crowd decide what plays next.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    navigate("/rooms");
                  }}
                  className="px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-700 font-semibold transition cursor-pointer"
                >
                  Create Room
                </button>
              ) : (
                <button
                  onClick={() => loginWithRedirect()}
                  className="px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-700 font-semibold transition cursor-pointer"
                >
                  Login to Create Room
                </button>
              )}

              <button className="px-8 py-4 rounded-2xl border border-slate-700 hover:bg-slate-900 transition font-semibold cursor-pointer">
                Join Room
              </button>
            </div>

            <div className="flex gap-8 mt-12">
              <div>
                <h3 className="text-3xl font-bold">10K+</h3>
                <p className="text-slate-400">Songs Queued</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold">500+</h3>
                <p className="text-slate-400">Rooms Created</p>
              </div>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Now Playing */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Now Playing</h3>

                <Play className="text-violet-500" />
              </div>

              <div className="mt-6">
                <h2 className="text-2xl font-bold">Starboy</h2>

                <p className="text-slate-400">The Weeknd</p>
              </div>

              <div className="flex gap-1 mt-6 items-end h-10">
                {[1, 2, 3, 4].map((bar) => (
                  <motion.div
                    key={bar}
                    animate={{
                      height: [10, 35, 15, 40, 20],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      delay: bar * 0.15,
                    }}
                    className="w-2 bg-violet-500 rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* Queue Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="font-semibold text-lg mb-4">Live Queue</h3>

              <div className="space-y-3">
                {songs.map((song, index) => (
                  <motion.div
                    layout
                    key={song.id}
                    className="flex items-center justify-between bg-slate-800 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-violet-400 font-bold">
                        #{index + 1}
                      </span>

                      <span>{song.name}</span>
                    </div>

                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                      }}
                      className="flex items-center gap-2 text-pink-400"
                    >
                      <Heart size={16} />
                      {song.votes}
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-6 text-slate-400">
                <Users size={18} />
                12 listeners connected
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-20">
        <h2 className="text-4xl font-bold text-center mb-14">
          How QueueCast Works
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              icon: Music,
              title: "Create Room",
              desc: "Start a music room in seconds",
            },
            {
              icon: QrCode,
              title: "Share QR",
              desc: "Invite anyone instantly",
            },
            {
              icon: Heart,
              title: "Vote Songs",
              desc: "Everyone influences the queue",
            },
            {
              icon: Play,
              title: "Play Top Songs",
              desc: "Most voted songs play first",
            },
          ].map((feature) => (
            <motion.div
              whileHover={{
                y: -8,
              }}
              key={feature.title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <feature.icon size={32} className="text-violet-500 mb-4" />

              <h3 className="font-semibold text-xl">{feature.title}</h3>

              <p className="text-slate-400 mt-2">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
