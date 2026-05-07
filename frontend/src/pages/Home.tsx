import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect } from "react";
import { createRoom, socket } from "../socket/socket";
import { useNavigate } from "react-router";

const Home: React.FC = () => {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  return (
    <div className="grid grid-rows-4 gap-10 p-10">
      <h1 className="h-1 text-2xl text-center ">QueueCast</h1>
      <div className="flex justify-center">
        {!isAuthenticated ? (
          <button
            className="border cursor-pointer rounded-2xl p-2 px-5"
            onClick={() => loginWithRedirect()}
          >
            login
          </button>
        ) : (
          <button
            className="border cursor-pointer rounded-2xl px-10"
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            logout
          </button>
        )}
      </div>
      {isAuthenticated && user && (
        <div>
          <h1>Login Successful</h1>
          <p>Email: {user.email}</p>
          <p>Username: {user.name}</p>
        </div>
      )}
      {isAuthenticated && (
        <div>
          <button
            onClick={() => {
              if (user?.email) {
                console.log("Creating");
                createRoom(user?.email);
              }
            }}
            className="border cursor-pointer rounded-2xl p-2 px-5"
          >
            {" "}
            create room
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
