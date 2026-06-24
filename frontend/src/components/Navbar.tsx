import type React from "react";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { socket } from "../socket/socket";
import { LogOut, Music } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { syncUser } from "../store/slices/UserSlice";
import { NavLink } from "react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  addClient,
  addNewRoom,
  addSong,
  leftClient,
  removeSongFromRoom,
  removeSongFromWaiting,
  setCurrentPlaying,
  setCurrentRoom,
  setMasterTime,
  setSongLikes,
} from "../store/slices/RoomsSlice";
import type { Room, RoomUser } from "../types/Room";
import NotificationContainer from "./notifications/NotificationContainer";
import { notify } from "../utils/notify";
import type { Song } from "../types/Song";
import Events from "../enums/Event";
import { setLoading, setPlayingState } from "../store/slices/PlayerSlice";
import type { MasterTime, NowPlaying } from "../types/NowPlaying";

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentRoom = useAppSelector((state) => state.rooms.currentRoom);
  const { auth0Id } = useAppSelector((state) => state.user);
  const animatedLineProps = {
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    style: {
      transformOrigin: "12px 12px",
    },
    transition: {
      duration: 0.25,
    },
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "About",
      path: "/about",
    },
    {
      name: "Rooms",
      path: "/rooms",
    },
  ];
  // const navigate = useNavigate();
  const {
    loginWithRedirect,
    getAccessTokenSilently,
    logout,
    user,
    isAuthenticated,
  } = useAuth0();
  useEffect(() => {
    const setUserDetails = async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://queuecast-api",
        },
      });
      if (!user?.email) {
        return;
      }
      dispatch(
        syncUser({
          email: user?.email,
          picture: user?.picture ?? "",
          username: user.name ?? "",
          token: token,
        }),
      );
    };
    if (isAuthenticated) {
      setUserDetails();
    }
  }, [isAuthenticated, user, dispatch]);
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      interface RoomJoinedMessage {
        event: "room-joined";
        message: {
          room: Room;
        };
      }
      interface ClientJoinedMessage {
        event: "client-joined";
        message: {
          client: RoomUser;
        };
      }
      interface ClientLeftMessage {
        event: "client-left";
        message: {
          auth0Id: string;
        };
      }
      interface ErrorMessage {
        event: "error";
        message: {
          title: string;
          message: string;
          event: string;
          data: {
            id: string;
          };
        };
      }
      interface SongAdded {
        event: "song-added";
        message: Song;
      }
      interface SongLikes {
        event: "like-song";
        message: {
          likes: number;
          songId: string;
        };
      }
      interface NewRoom {
        event: "new-room";
        message: {
          room: Room;
        };
      }
      interface NextSong {
        event: "next-song";
        message: Song;
      }
      interface SocketNowPlaying extends NowPlaying {
        playing: boolean;
      }
      interface CurrentSong {
        event: "current-song";
        message: SocketNowPlaying;
      }
      interface UpdateMasterTime {
        event: "update-master-time";
        message: MasterTime;
      }
      interface UpdatePlayerState {
        event: "update-master-time";
        message: boolean;
      }

      if (message.event === "room-joined") {
        const data: RoomJoinedMessage = JSON.parse(event.data);
        dispatch(setCurrentRoom({ room: data.message.room }));
        notify(
          "success",
          "Room Joined Successfully",
          `Room Name: ${data.message.room.name}`,
        );
        navigate(`/room/${data.message.room.roomId}`);
      } else if (message.event === "client-joined") {
        const data: ClientJoinedMessage = JSON.parse(event.data);
        console.log(data.message.client);
        dispatch(
          addClient({
            client: data.message.client,
          }),
        );
      } else if (message.event === "client-left") {
        const data: ClientLeftMessage = JSON.parse(event.data);
        console.log("Client Left: ", data.message.auth0Id);
        dispatch(
          leftClient({
            auth0Id: data.message.auth0Id,
          }),
        );
      } else if (message.event === "error") {
        const data: ErrorMessage = JSON.parse(event.data);
        console.log("WS Error From Server: ", data.message);
        notify("error", data.message.title, data.message.message);
        if (data.message.event === Events.AddSong) {
          dispatch(removeSongFromWaiting(data.message.data.id));
        } else if (data.message.event === Events.NextSong) {
          dispatch(setLoading(false));
        }
      } else if (message.event === "song-added") {
        const data: SongAdded = JSON.parse(event.data);
        dispatch(addSong(data.message));
        notify("success", "Song Added", "Name :" + data.message.name);
      } else if (message.event === "like-song") {
        const data: SongLikes = JSON.parse(event.data);
        dispatch(
          setSongLikes({
            likes: data.message.likes,
            songId: data.message.songId,
          }),
        );
      } else if (message.event === "new-room") {
        const data: NewRoom = JSON.parse(event.data);
        dispatch(addNewRoom(data.message.room));
      } else if (message.event === "current-song") {
        const data: CurrentSong = JSON.parse(event.data);
        dispatch(setCurrentPlaying(data.message));
        if (currentRoom?.owner.auth0Id !== auth0Id) {
          dispatch(setLoading(false));
          dispatch(setPlayingState(data.message.playing));
        }
      } else if (message.event === "next-song") {
        const data: NextSong = JSON.parse(event.data);
        dispatch(
          setCurrentPlaying({
            song: data.message,
            masterTime: {
              date: Date.now(),
              currentTime: 0,
              duration: 0,
            },
          }),
        );
        dispatch(removeSongFromRoom(data.message));
        dispatch(setLoading(true));
      } else if (message.event === "update-master-time") {
        const data: UpdateMasterTime = JSON.parse(event.data);
        console.log(data);
        if (currentRoom?.owner.auth0Id !== auth0Id)
          dispatch(setMasterTime(data.message));
      } else if (message.event == "update-player-state") {
        const data: UpdatePlayerState = JSON.parse(event.data);
        if (currentRoom?.owner.auth0Id !== auth0Id) {
          dispatch(setLoading(false));
          dispatch(setPlayingState(data.message));
        }
      }
    };

    socket.addEventListener("message", handler);

    return () => {
      socket.removeEventListener("message", handler);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <nav className="relative z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 md:px-10 py-5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Music className="text-violet-500" size={28} />

            <h1 className="text-2xl font-bold">
              Queue<span className="text-violet-500">Cast</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive
                      ? "text-violet-400"
                      : "text-slate-300 hover:text-white"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <button
                onClick={() => loginWithRedirect()}
                className="bg-violet-600 hover:bg-violet-700 transition px-5 py-2 rounded-xl font-medium cursor-pointer"
              >
                Login
              </button>
            ) : (
              <>
                <img
                  src={user?.picture}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full border-2 border-violet-500"
                />

                <button
                  onClick={() =>
                    logout({
                      logoutParams: {
                        returnTo: window.location.origin,
                      },
                    })
                  }
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 cursor-pointer"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="text-black dark:text-white"
            >
              {/* Top Line */}
              <motion.line
                x1="4"
                y1="6"
                x2="20"
                y2="6"
                {...animatedLineProps}
                animate={{
                  rotate: mobileMenuOpen ? 45 : 0,
                  y: mobileMenuOpen ? 6 : 0,
                }}
                style={{ transformOrigin: "12px 12px" }}
              />

              {/* Middle Line */}
              <motion.line
                x1="4"
                y1="12"
                x2="20"
                y2="12"
                {...animatedLineProps}
                animate={{
                  opacity: mobileMenuOpen ? 0 : 1,
                }}
              />

              {/* Bottom Line */}
              <motion.line
                x1="4"
                y1="18"
                x2="20"
                y2="18"
                {...animatedLineProps}
                animate={{
                  rotate: mobileMenuOpen ? -45 : 0,
                  y: mobileMenuOpen ? -6 : 0,
                }}
                style={{ transformOrigin: "12px 12px" }}
              />
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{
                transform: "translateY(-200px)",
                height: 0,
                opacity: 0,
              }}
              animate={{
                transform: "translateY(-0px)",
                height: "auto",
                opacity: 1,
              }}
              exit={{ transform: "translateY(-300px)", height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-slate-800 px-6 py-4 bg-slate-950 relative z-0"
            >
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `transition-colors ${
                        isActive
                          ? "text-violet-400"
                          : "text-slate-300 hover:text-white"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}

                <div className="pt-4 border-t border-slate-800">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => loginWithRedirect()}
                      className="w-full bg-violet-600 hover:bg-violet-700 py-2 rounded-xl"
                    >
                      Login
                    </button>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={user?.picture}
                          alt={user?.name}
                          className="w-10 h-10 rounded-full border border-violet-500"
                        />

                        <div>
                          <p className="font-medium">{user?.name}</p>

                          <p className="text-xs text-slate-400">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          logout({
                            logoutParams: {
                              returnTo: window.location.origin,
                            },
                          })
                        }
                        className="p-2 rounded-lg bg-slate-900"
                      >
                        <LogOut size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <Outlet></Outlet>
      <NotificationContainer />
    </div>
  );
};

export default Navbar;
