import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { useLocation } from "react-router-dom";
import styled from 'styled-components';

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const [screenSharing, setScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const location = useLocation();
  const room = location.state?.roomnumber;

  const toggleScreenSharing = async () => {
    try {
      if (!screenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        peer.peer.addTrack(stream.getTracks()[0], stream); // 화면 공유 스트림을 peer에 추가합니다
      } else {
        screenStream.getTracks().forEach((track) => track.stop()); // 화면 공유 스트림의 트랙을 중지합니다
        peer.peer.getSenders().forEach((sender) => {
          if (sender.track === screenStream.getTracks()[0]) {
            peer.peer.removeTrack(sender); // peer에서 화면 공유 스트림의 트랙을 제거합니다
          }
        });
        setScreenStream(null);
      }
      setScreenSharing(!screenSharing);
    } catch (error) {
      console.error("Error accessing screen:", error);
    }
  };

  const handleUserJoined = useCallback(async ({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);

    // 새로운 사용자가 방에 들어오면 자동으로 호출을 시작
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: id, offer });
    setMyStream(stream);
  }, [socket]);
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);
  const handleSendMessage = (e) => {
    e.preventDefault();
    const message = newMessage.trim();
    if (message !== '') {
      const formattedMessage = `${message}`; // [나] 표시를 추가한 형식의 메시지 생성
      socket.emit('chatMessage', formattedMessage);
      setMessages((prevMessages) => [...prevMessages, formattedMessage]); // 포맷된 메시지를 messages에 추가
      setNewMessage('');
    }
  };
  useEffect(() => {
    socket.on('chatMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, [socket]);

  return (
    <div>
      <Header>
        <h1>회의실 {`${room}`}</h1>
      </Header>

      <ConnectStatus>
        <h4>{remoteSocketId ? "연결되었습니다" : "접속중인 유저가 없습니다"}</h4>
      </ConnectStatus>

      <ButtonContainer>
        {myStream && <SendStreamButton onClick={sendStreams}>내 화면 공유하기</SendStreamButton>}
        {remoteSocketId && <CallButton onClick={handleCallUser}>화상통과 걸기</CallButton>}
        <ScreenShareButton onClick={toggleScreenSharing}>
          {screenSharing ? "화면공유 중지" : "화면공유"}
        </ScreenShareButton>
      </ButtonContainer>

      <p>{screenSharing ? "화면공유중 입니다" : ""}</p>
      <VideoContainer>
        {myStream && (
          <MyStreamContainer>

            <Video>
              <ReactPlayer
                playing
                url={myStream}
              />
            </Video>
            <MyStreamText>내 영상</MyStreamText>
          </MyStreamContainer>
        )}
        {remoteStream && (
          <RemoteContainer>

            <Video>
              <ReactPlayer
                playing
                url={remoteStream}
              />
            </Video>
            <RemoteText>상대방 영상</RemoteText>
          </RemoteContainer>
        )}
      </VideoContainer>
      {screenStream && (
        <>
          <h1>화면 공유</h1>
          <ReactPlayer
            playing
            height="100px"
            width="200px"
            url={screenStream}
          />
        </>
      )}
      <form onSubmit={handleSendMessage}>
        <SendContainer>
          <input
            type="text"
            value={newMessage}
            style={{ width: "65%", height: "40px", borderRadius: "12px", fontSize: "large" }}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <SendButton type="submit" onClick={handleSendMessage}>전송</SendButton>
        </SendContainer>
      </form>
      <ScrollContainer style={{ maxHeight: "90px", overflow: "auto" }}>
        <ul style={{ listStyleType: "none" }}>
          {messages.map((message, index) => (
            <li key={index} style={{ color: message.includes('[나]') ? 'blue' : 'black' }}>{message}</li>
          ))}
        </ul>
      </ScrollContainer>
    </div>
  );
};

const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  background-color: #5898ff;
`;

const ConnectStatus = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 40px;
  background-color: #23a756;
`;

const SendStreamButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 30px;
  border-radius: 5px;
  margin-left: 10px;
  margin-right: 10px;
  cursor: pointer;
  background-color: #0379E5;
`;

const CallButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 110px;
  height: 30px;
  border-radius: 5px;
  margin-left: 10px;
  margin-right: 10px;
  cursor: pointer;
  background-color: #0379E5;
`;

const ScreenShareButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 30px;
  border-radius: 5px;
  margin-left: 10px;
  margin-right: 10px;
  cursor: pointer;
  background-color: #0379E5;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
`;

const MyStreamContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
`;

const MyStreamText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
`;

const RemoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
`;

const RemoteText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
`;

const Video = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const VideoContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: 20px;
`;

const SendButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70px;
  height: 40px;
  border-radius: 11px;
  margin-left: 10px;
  cursor: pointer;
  background-color: #23a756;
`;

const SendContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const ScrollContainer = styled.div`
  overflow-x:hidden;
  overflow: scroll;
  &::-webkit-scrollbar{
    width: 8px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.4);
  }
  &::-webkit-scrollbar-thumb{
    border-radius: 6px;
    background-color: rgba(0, 0, 0, 0.3);
  }
`;
export default RoomPage;