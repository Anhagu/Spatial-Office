import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  // 이메일과 방 번호 값을 저장하기 위한 상태 변수
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket(); // SocketProvider 컨텍스트에서 소켓 인스턴스에 접근
  const navigate = useNavigate(); // react-router-dom의 navigate 함수에 접근하여 다른 경로로 이동

  // 폼 제출 처리 함수
  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room }); // "room:join" 이벤트를 통해 서버에 이메일과 방 번호 전송
    },
    [email, room, socket]
  );

  // 방 참가 처리 함수
  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`); // 해당 방 번호를 포함한 경로로 이동
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom); // "room:join" 이벤트 리스너 등록
    return () => {
      socket.off("room:join", handleJoinRoom); // 컴포넌트 언마운트 시 이벤트 리스너 제거
    };
  }, [socket, handleJoinRoom]);

  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <label htmlFor="email">Email ID</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label htmlFor="room">Room Number</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        <button>Join</button>
      </form>
    </div>
  );
};

export default LobbyScreen;
