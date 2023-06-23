import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const BOARD_SIZE = 30;
const OFFICES = [
  { x: 20, y: 0, width: 15, height: 13, color: 'yellow',roomnumber: 3 },  // No action for this office
  { x: 0, y: 20, width: 20, height: 10, color: 'lightblue', roomnumber: 2 },
  { x: 0, y: 0, width:20, height: 10, color: 'lightgreen', roomnumber: 4 },
  { x: 10, y: 10, width: 10, height: 10, color: 'lightgray' },  // No action for this office
  { x: 20, y: 10, width: 10, height: 20, color: 'lightsalmon', roomnumber: 1 },
  { x: 0, y: 10, width: 10, height: 5, color: 'cyan'},
  { x: 0, y: 15, width: 1, height: 5, color: 'red', goBack: true },
];

const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇","😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "🙂", "🤗",
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

const VirtualOffice = () => {
  const [position, setPosition] = useState(START_POSITION);
  const [tileSize, setTileSize] = useState(
    Math.min(Math.floor(window.innerWidth / BOARD_SIZE), Math.floor(window.innerHeight / BOARD_SIZE))
  );
  const [positions, setPositions] = useState({});
  const [clientId, setClientId] = useState(null);
  const navigate = useNavigate();

  const socket = io('http://localhost:8000');

  useEffect(() => {
    socket.on('connect', () => {
      setClientId(socket.id);
    });
  }, [socket]);

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
    // Check if the position is in the 'go back' office area
    for (let office of OFFICES) {
      if (
        position[0] >= office.x && position[1] >= office.y &&
        position[0] < office.x + office.width && position[1] < office.y + office.height &&
        office.goBack
      ) {
        shouldGoBack = true;
        break;
      }
    }
  
    if (shouldGoBack) {
      window.history.back();
    }
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
    // Check if the position is in any of the office areas with room numbers
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

  const grid = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const key = `${y}-${x}`;
      let color = 'white';
      // Check if the tile is in any of the office areas
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
            border: "1px solid black",
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
