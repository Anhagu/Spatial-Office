import { Routes, Route } from "react-router-dom";
import "./App.css";
import LobbyScreen from "./screens/Lobby";
import RoomPage from "./screens/Room";
import MainPage from "./screens/MainPage";
import SignUp from "./screens/SignUp";
import VirtualOffice from "./screens/VirtualOffice";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/virtualoffice" element={<VirtualOffice />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/lobby" element={<LobbyScreen />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
