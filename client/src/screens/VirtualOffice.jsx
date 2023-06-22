import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const BOARD_SIZE = 30;
const OFFICE_SIZE = 10;
const RED_TILE_POSITION = [5, 5];

const VirtualOffice = () => {
  const [position, setPosition] = useState([0, 0]);
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
    const handleUserMove = ({ id, position }) => {
      setPositions((prevPositions) => ({ ...prevPositions, [id]: position }));
    };

    socket.on("user:move", handleUserMove);

    return () => {
      socket.off("user:move", handleUserMove);
    };
  }, []);

  useEffect(() => {
    if (position[0] === RED_TILE_POSITION[0] && position[1] === RED_TILE_POSITION[1]) {
      navigate("/Lobby");
    }
  }, [position, navigate]);

  const grid = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const key = `${y}-${x}`;
      if (x === RED_TILE_POSITION[0] && y === RED_TILE_POSITION[1]) {
        grid.push(
          <div
            key={key}
            style={{
              backgroundColor: "red",
              border: "1px solid black",
              width: `${tileSize}px`,
              height: `${tileSize}px`,
              boxSizing: "border-box",
            }}
          />
        );
      } else if (
        x >= (BOARD_SIZE - OFFICE_SIZE) / 2 &&
        y >= (BOARD_SIZE - OFFICE_SIZE) / 2 &&
        x < (BOARD_SIZE + OFFICE_SIZE) / 2 &&
        y < (BOARD_SIZE + OFFICE_SIZE) / 2
      ) {
        grid.push(
          <div
            key={key}
            style={{
              backgroundColor: "lightgray",
              border: "1px solid black",
              width: `${tileSize}px`,
              height: `${tileSize}px`,
              boxSizing: "border-box",
            }}
          />
        );
      } else {
        grid.push(
          <div
            key={key}
            style={{
              backgroundColor: "white",
              border: "1px solid black",
              width: `${tileSize}px`,
              height: `${tileSize}px`,
              boxSizing: "border-box",
            }}
          />
        );
      }
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
        <div
          key={id}
          style={{
            position: "absolute",
            left: `${pos[0] * tileSize}px`,
            top: `${pos[1] * tileSize}px`,
            backgroundColor: stringToColor(id),
            width: `${tileSize}px`,
            height: `${tileSize}px`,
          }}
        ></div>
      ))}
    </div>
  );
};

export default VirtualOffice;
