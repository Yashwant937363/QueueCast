import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Navbar from "./components/Navbar";
import Rooms from "./pages/Rooms";
import Youtube from "./pages/Youtube";
import JioSaavan from "./pages/JioSaavan";
import { useAppDispatch } from "./store/hooks";
import { useEffect } from "react";
import { getRooms } from "./store/slices/RoomsSlice";

function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getRooms());
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<Home />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="room/:roomId" element={<Room />} />
        </Route>
        <Route path="/youtube" element={<Youtube />} />
        <Route path="/jiosaavn" element={<JioSaavan />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
