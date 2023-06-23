import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const BOARD_SIZE = 30;
const OFFICES = [
  { x: 20, y: 0, width: 15, height: 13, color: 'yellow', roomnumber: 3 },  // No action for this office
  { x: 0, y: 20, width: 20, height: 10, color: 'lightblue', roomnumber: 2 },
  { x: 0, y: 0, width: 20, height: 10, color: 'lightgreen', roomnumber: 4 },
  { x: 10, y: 10, width: 10, height: 10, color: 'lightgray' },  // No action for this office
  { x: 20, y: 5, width: 10, height: 25, color: 'lightsalmon', roomnumber: 1 },
  { x: 0, y: 10, width: 10, height: 5, color: 'cyan' },
  { x: 0, y: 15, width: 1, height: 5, color: 'red', goBack: true },
];

const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "🙂", "🤗",
  "🤩", "🤔", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬",
  "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢",
  "🤮", "🤧", "😵", "🤯", "🥵", "😰", "😨", "😥", "🥴", "😓",
  "🤠", "👽", "🤡", "💀", "👻", "👺", "🤖", "👾", "🎃", "😺",
  "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🙈", "🙉",]; // 여기에 원하는 이모지를 추가하세요.

function getEmojiFromId(id) {
  const hash = id.split("").reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return emojis[Math.abs(hash) % emojis.length];
}

const START_POSITION = [11, 16];

const Sidebar = ({ userEmail, onLogout, isTimerPaused, onPauseTimer, onResumeTimer }) => {
  const [time, setTime] = useState(0);
  const [pauseTime, setPauseTime] = useState(null);


  useEffect(() => {
    const loginTime = localStorage.getItem('loginTime');

    if (!loginTime) {
      localStorage.setItem('loginTime', Date.now());
    } else {
      let elapsedSec;
      if (pauseTime) {
        elapsedSec = Math.floor((pauseTime - loginTime) / 1000);
      } else {
        elapsedSec = Math.floor((Date.now() - loginTime) / 1000);
      }
      setTime(elapsedSec);
    }

    const intervalId = setInterval(() => {
      if (!isTimerPaused) {
        setTime(prevTime => prevTime + 1);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isTimerPaused, pauseTime]);

  const handleLogout = () => {
    onLogout(time);
    localStorage.removeItem('loginTime');
    localStorage.removeItem('pauseTime');
  };
  function secondsToHMS(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hours, minutes, secs].map(v => v < 10 ? '0' + v : v).join(':');
  }



  return (
    <>
      <div style={{ position: 'absolute', right: 100, top: 200, padding: 20 }}>
        <h1>반갑습니다 {userEmail} 님!</h1>
        <h2>업무시간: {secondsToHMS(time)}</h2>
        {!isTimerPaused ? (
          <button
            onClick={onPauseTimer}
            style={{
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#0379E5',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            타이머 일시 정지
          </button>
        ) : (
          <button
            onClick={onResumeTimer}
            style={{
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#0379E5',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            타이머 재개
          </button>
        )}
        <button
          onClick={handleLogout}
          style={{
            borderRadius: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#0379E5',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          업무종료
        </button>
      </div>
      <div style={{ position: 'absolute', left: 500, bottom: 180, padding: 20 }}>
        <h1>회의실 1</h1>
      </div>
      <div style={{ position: 'absolute', left: 160, bottom: 80, padding: 20 }}>
        <h1>회의실 2</h1>
      </div>
      <div style={{ position: 'absolute', left: 500, top: 80, padding: 20 }}>
        <h1>회의실 3</h1>
      </div>
      <div style={{ position: 'absolute', left: 150, top: 50, padding: 20 }}>
        <h1>회의실 4</h1>
      </div>
      <div style={{ position: 'absolute', left: 45, top: 220, padding: 20 }}>
        <h1>휴게실</h1>
      </div>
      <div style={{ position: 'absolute', left: 280, top: 220, padding: 20 }}>
        <h1>사무실</h1>
      </div>
    </>
  );
};


const VirtualOffice = () => {
  const [userEmail, setUserEmail] = useState('');
  const [position, setPosition] = useState(START_POSITION);
  const [tileSize, setTileSize] = useState(
    Math.min(Math.floor(window.innerWidth / BOARD_SIZE), Math.floor(window.innerHeight / BOARD_SIZE))
  );
  const [positions, setPositions] = useState({});
  const [clientId, setClientId] = useState(null);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const navigate = useNavigate();

  const socket = io('http://localhost:8000');

  const handleLogout = (time) => {
    const date = new Date();
    const currentTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    alert(`업무시간: ${time}, 업무 종료시간: ${currentTime}`);
    setUserEmail('');
    console.log(`${userEmail}, 고생하셨습니다!`);

    localStorage.removeItem('email');

    navigate("/");
  };

  const handleTimerPause = () => {
    setIsTimerPaused(true);
    localStorage.setItem('pauseTime', Date.now());
  };

  const handleTimerResume = () => {
    setIsTimerPaused(false);
    const pauseTime = localStorage.getItem('pauseTime');
    if (pauseTime) {
      const resumeTime = Date.now();
      const pauseDuration = resumeTime - pauseTime;
      const loginTime = localStorage.getItem('loginTime');
      localStorage.setItem('loginTime', Number(loginTime) + pauseDuration);
      localStorage.removeItem('pauseTime');
    }
  };
  useEffect(() => {
    socket.on('connect', () => {
      setClientId(socket.id);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { keyCode } = e;
      setPosition((prevPosition) => {
        const newPosition = [...prevPosition];
        if (keyCode === 37 && newPosition[0] > 0) {
          newPosition[0]--;
        } else if (keyCode === 38 && newPosition[1] > 0) {
          newPosition[1]--;
        } else if (keyCode === 39 && newPosition[0] < BOARD_SIZE - 1) {
          newPosition[0]++;
        } else if (keyCode === 40 && newPosition[1] < BOARD_SIZE - 1) {
          newPosition[1]++;
        }
        socket.emit("user:move", { id: clientId, position: newPosition });
        return newPosition;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [clientId]);

  useEffect(() => {
    const handleResize = () => {
      setTileSize(
        Math.min(Math.floor(window.innerWidth / BOARD_SIZE), Math.floor(window.innerHeight / BOARD_SIZE))
      );
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    let shouldGoBack = false;
    let shouldPauseTimer = false;

    for (let office of OFFICES) {
      if (
        position[0] >= office.x && position[1] >= office.y &&
        position[0] < office.x + office.width && position[1] < office.y + office.height
      ) {
        if (office.goBack) {
          shouldGoBack = true;
        }

        // Check if the current office has a color of 'cyan'
        if (office.color === 'cyan') {
          shouldPauseTimer = true;
        }
      }
    }

    if (shouldGoBack) {
      window.history.back();
    }

    if (shouldPauseTimer) {
      handleTimerPause();
    } else {
      handleTimerResume();
    }

    // If the position is in the 'cyan' office, pause the timer
    setIsTimerPaused(shouldPauseTimer);
  }, [position]);

  useEffect(() => {
    const handleUserMove = ({ id, position }) => {
      setPositions((prevPositions) => ({ ...prevPositions, [id]: position }));
    };

    socket.on("user:move", handleUserMove);

    return () => {
      socket.off("user:move", handleUserMove);
    };
  }, []);

  useEffect(() => {
    let roomnumber = null;
    for (let office of OFFICES) {
      if (
        position[0] >= office.x && position[1] >= office.y &&
        position[0] < office.x + office.width && position[1] < office.y + office.height &&
        office.roomnumber
      ) {
        roomnumber = office.roomnumber;
        break;
      }
    }

    if (roomnumber !== null) {
      navigate("/Lobby", { state: { roomnumber: roomnumber } });
    }
  }, [position, navigate]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const grid = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const key = `${y}-${x}`;
      let color = 'white';
      for (let office of OFFICES) {
        if (x >= office.x && y >= office.y && x < office.x + office.width && y < office.y + office.height) {
          color = office.color;
          break;
        }
      }
      grid.push(
        <div
          key={key}
          style={{
            backgroundColor: color,
            // border: "1px solid black",
            width: `${tileSize}px`,
            height: `${tileSize}px`,
            boxSizing: "border-box",
          }}
        />
      );
    }
  }

  function hashToColor(hash) {
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }



  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hashToColor(hash);
  }

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: `repeat(${BOARD_SIZE}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, ${tileSize}px)`,
      }}
    >
      {userEmail && (
        <Sidebar
          userEmail={userEmail}
          onLogout={handleLogout}
          isTimerPaused={isTimerPaused}
          onPauseTimer={handleTimerPause}
          onResumeTimer={handleTimerResume}
        />
      )}
      {grid}
      {Object.entries(positions).map(([id, pos]) => (
        <span
          key={id}
          style={{
            position: "absolute",
            left: `${pos[0] * tileSize}px`,
            top: `${pos[1] * tileSize}px`,
            width: `${tileSize}px`,
            height: `${tileSize}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: `${tileSize}px`,
          }}
        >
          {getEmojiFromId(id)}
        </span>
      ))}
    </div>
  );
};

export default VirtualOffice;
