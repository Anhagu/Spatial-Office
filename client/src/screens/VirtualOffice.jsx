import React, { useState, useEffect } from 'react';

const BOARD_SIZE = 30;  // 바둑판의 크기
const OFFICE_SIZE = 10;  // 사무공간의 크기

const VirtualOffice = () => {
  const [position, setPosition] = useState([0, 0]);  
  const [tileSize, setTileSize] = useState(Math.min(Math.floor(window.innerWidth / BOARD_SIZE), Math.floor(window.innerHeight / BOARD_SIZE)));  

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { keyCode } = e;
      setPosition(prevPosition => {
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
        return newPosition;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setTileSize(Math.min(Math.floor(window.innerWidth / BOARD_SIZE), Math.floor(window.innerHeight / BOARD_SIZE)));
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 바둑판 배경 생성
  const grid = [];
  for(let y = 0; y < BOARD_SIZE; y++) {
    for(let x = 0; x < BOARD_SIZE; x++) {
      const key = `${y}-${x}`;
      if(x >= (BOARD_SIZE - OFFICE_SIZE) / 2 && x < (BOARD_SIZE + OFFICE_SIZE) / 2 && y >= (BOARD_SIZE - OFFICE_SIZE) / 2 && y < (BOARD_SIZE + OFFICE_SIZE) / 2) {
        grid.push(<div key={key} style={{backgroundColor: "white", border: "1px solid black", width: `${tileSize}px`, height: `${tileSize}px`, boxSizing: "border-box"}}/>);
      } else {
        grid.push(<div key={key} style={{backgroundColor: "gray", border: "1px solid white", width: `${tileSize}px`, height: `${tileSize}px`, boxSizing: "border-box"}}/>);
      }
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      tabIndex="0"
    >
      <div
        style={{
          width: `${BOARD_SIZE * tileSize}px`,
          height: `${BOARD_SIZE * tileSize}px`,
          display: "flex",
          flexWrap: "wrap",
          position: "relative",
        }}
      >
        {grid}
        <div
          style={{
            position: "absolute",
            left: `${position[0] * tileSize}px`,
            top: `${position[1] * tileSize}px`,
            backgroundColor: "blue",
            width: `${tileSize}px`,
            height: `${tileSize}px`,
          }}
        >
        </div>
      </div>
    </div>
  );
};

export default VirtualOffice;
