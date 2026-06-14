import type React from "react";
import { useEffect } from "react";
import { Outlet } from "react-router";
import { socket } from "../socket/socket";
import { LogOut, Music } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppDispatch } from "../store/hooks";
import { syncUser } from "../store/slices/UserSlice";
import { NavLink } from "react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  addClient,
  leftClient,
  setCurrentRoom,
} from "../store/slices/RoomsSlice";
import type { Room, RoomUser } from "../types/Room";

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const commonProps = {
    strokeWidth: 2,
    strokeLinecap: "round" as const,
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
    console.log("Authenticated: ", isAuthenticated);
  }, [isAuthenticated, user, dispatch]);
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      interface RoomJoinedMessage {
        event: "room-joined";
        data: {
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
      if (message.event === "room-joined") {
        const data: RoomJoinedMessage = JSON.parse(event.data);
        console.log(data.data.room);
        dispatch(setCurrentRoom({ room: data.data.room }));
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <motion.svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor" // 🔥 Key line
              strokeWidth={2} // Add this if missing
              strokeLinecap="round" // Optional: nicer look
              strokeLinejoin="round" // Optional: smoother corners
              className="cursor-pointer md:hidden text-black dark:text-white"
            >
              {/* Top Line */}
              <motion.line
                x1="3"
                x2="21"
                y1="6"
                y2="6"
                {...commonProps}
                animate={{
                  y1: mobileMenuOpen ? 12 : 6,
                  y2: mobileMenuOpen ? 12 : 6,
                  rotate: mobileMenuOpen ? 45 : 0,
                  vertOriginX: "12",
                  vertOriginY: "12",
                }}
              />

              {/* Middle Line */}
              <motion.line
                x1="3"
                x2="21"
                y1="12"
                y2="12"
                {...commonProps}
                animate={{
                  opacity: mobileMenuOpen ? 0 : 1,
                }}
              />

              {/* Bottom Line */}
              <motion.line
                x1="3"
                x2="21"
                y1="18"
                y2="18"
                {...commonProps}
                animate={{
                  y1: mobileMenuOpen ? 12 : 18,
                  y2: mobileMenuOpen ? 12 : 18,
                  rotate: mobileMenuOpen ? -45 : 0,
                  vertOriginX: "12",
                  vertOriginY: "12",
                }}
              />
            </motion.svg>
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
    </div>
  );
};

export default Navbar;
