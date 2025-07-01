import React, { useState, useEffect, useRef } from "react";

const BOARD_SIZE = 4;
const TIMER_SECONDS = 90;

function generateBoard() {
  const board = [];
  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    board.push(Math.floor(Math.random() * 9) + 1);
  }
  return board;
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
    if (board[i] === 12) return true;
    if (board[i] >= 12) continue;
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
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      setMessage("");
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    if (!canMake12(board)) {
      setMessage("もう12が作れないからシャッフル！ 🔄");
      setBoard(generateBoard());
      setSelected([]);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [board, gameOver]);

  const handleMouseDown = (idx) => {
    if (gameOver || timeLeft <= 0) return;
    selectingRef.current = true;
    setSelected([idx]);
  };

  const handleMouseEnter = (idx) => {
    if (gameOver || timeLeft <= 0) return;
    if (!selectingRef.current) return;
    if (selected.includes(idx)) return;
    const lastIdx = selected[selected.length - 1];
    if (isAdjacent(lastIdx, idx)) {
      setSelected([...selected, idx]);
    }
  };

  const handleMouseUp = () => {
    selectingRef.current = false;
    if (gameOver || timeLeft <= 0) return;

    if (sum === 12 && selected.length > 0) {
      setMessage("すごい！✨");
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      const newBoard = [...board];
      selected.forEach((idx) => {
        newBoard[idx] = null;
      });
      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i] === null) {
          newBoard[i] = Math.floor(Math.random() * 9) + 1;
        }
      }
      setBoard(newBoard);
      setScore(score + selected.length);
      setSelected([]);
      setTimeout(() => setMessage(""), 3000);
    } else {
      setSelected([]);
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
      <div
        style={{
          maxWidth: 320,
          margin: "40px auto",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
          padding: 20,
          border: "2px solid #ccc",
          borderRadius: 12,
          backgroundColor: "#f9f9f9",
          userSelect: "none",
        }}
      >
        <h2>ゲーム終了！</h2>
        <p style={{ fontSize: 18 }}>あなたのスコアは <strong>{score}</strong> です。おめでとう！🎉</p>
        <button
          onClick={handleRestart}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            fontSize: 16,
            borderRadius: 8,
            border: "none",
            backgroundColor: "#70a1ff",
            color: "white",
            cursor: "pointer",
          }}
        >
          もう一度遊ぶ
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 320,
        margin: "40px auto",
        textAlign: "center",
        userSelect: "none",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>縦、横、斜めをつなげて１２を作るゲーム😎</h2>
      <div
        onMouseUp={handleMouseUp}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gap: 8,
          userSelect: "none",
          pointerEvents: timeLeft <= 0 ? "none" : "auto",
          opacity: timeLeft <= 0 ? 0.6 : 1,
        }}
      >
        {board.map((num, idx) => (
          <div
            key={idx}
            onMouseDown={() => handleMouseDown(idx)}
            onMouseEnter={() => handleMouseEnter(idx)}
            style={{
              background: selected.includes(idx) ? "#ffa502" : "#70a1ff",
              color: "white",
              fontSize: 22,
              fontWeight: "bold",
              borderRadius: 10,
              padding: 16,
              cursor: timeLeft <= 0 ? "default" : "pointer",
              transition: "background-color 0.3s",
              userSelect: "none",
              touchAction: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
            }}
          >
            {num}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: 18 }}>
        選択中の合計: <strong>{sum}</strong>
      </div>
      <div style={{ marginTop: 10, fontSize: 16 }}>
        スコア: <strong>{score}</strong>
      </div>

      <div style={{ marginTop: 10, fontSize: 14, color: "green", minHeight: 24 }}>
        {message}
      </div>

      <div style={{ marginTop: 16, fontSize: 16, color: timeLeft <= 10 ? "red" : "black" }}>
        残り時間: {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
        {(timeLeft % 60).toString().padStart(2, "0")}
      </div>
    </div>
  );
}
