import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import styled from 'styled-components';

const LobbyScreen = () => {
  // 이메일과 방 번호 값을 저장하기 위한 상태 변수
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket(); // SocketProvider 컨텍스트에서 소켓 인스턴스에 접근
  const navigate = useNavigate(); // react-router-dom의 navigate 함수에 접근하여 다른 경로로 이동
  const location = useLocation(); // react-router-dom의 useLocation 함수에 접근하여 현재 경로의 상태를 확인
  

  // 로그인 세션 확인 및 이메일 업데이트
  useEffect(() => {
    const loggedInEmail = localStorage.getItem("email");
    if (loggedInEmail) {
      setEmail(loggedInEmail);
    }
  }, []);

  // roomnumber 값이 있을 경우 방 번호 업데이트
  useEffect(() => {
    if (location.state?.roomnumber) {
      setRoom(location.state.roomnumber);
    }
  }, [location]);

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
      navigate(`/room/${room}`, { state: { roomnumber: room } }) // 해당 방 번호를 포함한 경로로 이동
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
      <section style={{ display: 'flex', justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw" }}>
        <div style={{
          backgroundColor: "#D9D9D9",
          borderRadius: "40px",
          padding: "20px",
          width: "464px",
          height: "596px",
          margin: "0 auto",
          textAlign: "center",
          position: "relative"
        }}>
          
          <BackSpace type="button" onClick={() => navigate(-1)}>{"<"}</BackSpace>

          <LobyText>회의실 입장</LobyText>
          <ConfirmText>
            이메일과 회의실 번호가
            <br />맞는지 확인해주세요
          </ConfirmText>

          <form>
            <div style={{ marginBottom: "10px", marginTop: "40px" }}>
              <Input
                type="email"
                id="email"
                value={email}
                placeholder="사용자 이메일을 입력해주세요"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <Input
                type="text"
                id="room"
                value={room}
                placeholder="회의실 번호를 입력해주세요"
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            <div>
              <button onClick={handleSubmitForm} style={{
                marginTop: "28px",
                fontSize: "25px",
                width: "82.5%",
                backgroundColor: "#0379E5",
                color: "white",
                border: "none",
                padding: "17px 20px",
                borderRadius: "8px",
                cursor: "pointer"
              }}>
                입장하기
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

const LobyText = styled.div`
  margin-top: 35px;
  font-size: 40px;
  font-weight: bold;
`;

const ConfirmText = styled.div`
  margin-top: 20px;
  font-size: 25px;
  font-weight: bold;
`;

const Input = styled.input`
  
  border: 0;
  outline: none;
  font-size: 10px;
  width: 345px;
  height: 30px;
  border: 1px solid #dddddd !important;
  font-size: 1.3rem;
  line-height: 1.45;
  letter-spacing: -0.04rem;
  padding: 16px;
  margin-top: 12px;
  &::placeholder{
    color: #7c7c7c;
  }
`;

const BackSpace = styled.div`
  font-size: 30px;
  font-weight: auto;
  width: 30px;
  cursor: pointer;
`;

export default LobbyScreen;
