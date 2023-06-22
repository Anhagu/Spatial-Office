import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const [screenSharing, setScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);

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

  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      <button onClick={toggleScreenSharing}>
        {screenSharing ? "Stop Sharing" : "Share Screen"}
      </button>
      <p>{screenSharing ? "Screen is being shared" : ""}</p>
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            height="100px"
            width="200px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            height="100px"
            width="200px"
            url={remoteStream}
          />
        </>
      )}
      {screenStream && (
        <>
          <h1>Screen Stream</h1>
          <ReactPlayer
            playing
            height="100px"
            width="200px"
            url={screenStream}
          />
        </>
      )}
    </div>
  );
};

export default RoomPage;
