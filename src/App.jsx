import React, { useState, useEffect, useRef } from "react";

const BOARD_SIZE = 4;
const TIMER_SECONDS = 90;

function generateBoard() {
  return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () =>
    Math.floor(Math.random() * 9) + 1
  );
}

function isAdjacent(idx1, idx2) {
  const x1 = idx1 % BOARD_SIZE;
  const y1 = Math.floor(idx1 / BOARD_SIZE);
  const x2 = idx2 % BOARD_SIZE;
  const y2 = Math.floor(idx2 / BOARD_SIZE);
  return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
}

function canMake12(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (i !== j && board[i] + board[j] === 12 && isAdjacent(i, j)) {
        return true;
      }
    }
  }
  return false;
}

export default function Slide12() {
  const [board, setBoard] = useState(generateBoard());
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const selectingRef = useRef(false);

  const sum = selected.reduce((acc, idx) => acc + (board[idx] || 0), 0);

  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!canMake12(board)) {
      setMessage("もう12作れないからシャッフル！🔄");
      setTimeout(() => setMessage(""), 2000);
      setBoard(generateBoard());
    }
  }, [board]);

  const handleStart = (idx) => {
    if (gameOver) return;
    selectingRef.current = true;
    setSelected([idx]);
  };

  const handleEnter = (idx) => {
    if (!selectingRef.current || selected.includes(idx)) return;
    const lastIdx = selected[selected.length - 1];
    if (isAdjacent(lastIdx, idx)) {
      setSelected((prev) => [...prev, idx]);
    }
  };

  const handleEnd = () => {
    selectingRef.current = false;
    if (sum === 12 && selected.length > 0) {
      const newBoard = [...board];
      selected.forEach((idx) => {
        newBoard[idx] = Math.floor(Math.random() * 9) + 1;
      });
      setBoard(newBoard);
      setScore((prev) => prev + selected.length);
      setMessage("✨ナイス12✨");
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setTimeout(() => setMessage(""), 2000);
    }
    setSelected([]);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element?.dataset?.idx) {
      handleEnter(Number(element.dataset.idx));
    }
  };

  const handleRestart = () => {
    setBoard(generateBoard());
    setSelected([]);
    setScore(0);
    setTimeLeft(TIMER_SECONDS);
    setMessage("");
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <div style={styles.container}>
        <h2>⏰ ゲーム終了！</h2>
        <p>あなたのスコア：<strong>{score}</strong>点</p>
        <button onClick={handleRestart} style={styles.button}>もう一度遊ぶ</button>
      </div>
    );
  }

  return (
    <div
      style={styles.container}
      onMouseUp={handleEnd}
      onTouchEnd={handleEnd}
      onTouchMove={handleTouchMove}
    >
      <h2>数字をつなげて「12」を作れ！</h2>
      <div style={styles.grid}>
        {board.map((num, idx) => (
          <div
            key={idx}
            data-idx={idx}
            onMouseDown={() => handleStart(idx)}
            onMouseEnter={() => handleEnter(idx)}
            onTouchStart={() => handleStart(idx)}
            style={{
              ...styles.cell,
              backgroundColor: selected.includes(idx) ? "#ff4757" : "#1e90ff",
            }}
          >
            {num}
          </div>
        ))}
      </div>
      <div style={styles.info}>合計：{sum} ／ スコア：{score}</div>
      <div style={{ ...styles.info, color: timeLeft <= 10 ? "red" : "#333" }}>
        残り時間：{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
      </div>
      <div style={{ marginTop: 10, fontWeight: "bold" }}>{message}</div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 360,
    margin: "40px auto",
    padding: 20,
    border: "2px solid #ccc",
    borderRadius: 12,
    backgroundColor: "#fff",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    userSelect: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
    gap: 10,
    marginTop: 20,
  },
  cell: {
    width: 70,
    height: 70,
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    touchAction: "none",
  },
  info: {
    marginTop: 16,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    padding: "10px 20px",
    fontSize: 16,
    borderRadius: 8,
    backgroundColor: "#2ed573",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};
