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

  // スクロール禁止（スマホ含む）
  useEffect(() => {
    const preventScroll = (e) => e.preventDefault();
    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  // タイマー処理
  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // シャッフル処理（12作れなかったら）
  useEffect(() => {
    if (!canMake12(board)) {
      setMessage("もう12作れないからシャッフル！🔄");
      setTimeout(() => setMessage(""), 2000);
      setBoard(generateBoard());
    }
  }, [board]);

  // 選択開始
  const handleStart = (idx) => {
    if (gameOver) return;
    selectingRef.current = true;
    setSelected([idx]);
  };

  // 選択中に隣接チェックしながら追加
  const handleEnter = (idx) => {
    if (!selectingRef.current || selected.includes(idx)) return;
    const lastIdx = selected[selected.length - 1];
    if (isAdjacent(lastIdx, idx)) {
      setSelected([...selected, idx]);
    }
  };

  // 選択終了時処理
  const handleEnd = () => {
    selectingRef.current = false;
    if (sum === 12 && selected.length > 0) {
      const newBoard = [...board];
      selected.forEach((idx) => (newBoard[idx] = Math.floor(Math.random() * 9) + 1));
      setBoard(newBoard);
      setScore(score + selected.length);
      setSelected([]);
      setMessage("✨ナイス12✨");

      // バイブレーションON（対応してれば）
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([150, 100, 150]);
        } catch (e) {
          console.warn("Vibration not supported");
        }
      }

      setTimeout(() => setMessage(""), 2000);
    } else {
      setSelected([]);
    }
  };

  // 再スタート
  const handleRestart = () => {
    setBoard(generateBoard());
    setSelected([]);
    setScore(0);
    setTimeLeft(TIMER_SECONDS);
    setGameOver(false);
    setMessage("");
  };

  // スワイプ操作用
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.dataset?.idx) {
      handleEnter(Number(target.dataset.idx));
    }
  };

  if (gameOver) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <h2 style={styles.title}>⏰ 時間切れ！</h2>
          <p style={styles.text}>あなたのスコアは <strong>{score}</strong> 点！</p>
          <button onClick={handleRestart} style={styles.button}>もう一回！</button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={styles.wrapper}
      onMouseUp={handleEnd}
      onTouchEnd={handleEnd}
      onTouchMove={handleTouchMove}
    >
      <div style={styles.container}>
        <h2 style={styles.title}>合計12を作れ🎯</h2>
        <div style={styles.grid} onContextMenu={(e) => e.preventDefault()}>
          {board.map((num, idx) => (
            <div
              key={idx}
              data-idx={idx}
              onMouseDown={() => handleStart(idx)}
              onMouseEnter={() => handleEnter(idx)}
              onTouchStart={() => handleStart(idx)}
              style={{
                ...styles.cell,
                backgroundColor: selected.includes(idx) ? "#ff6b81" : "#1e90ff",
              }}
            >
              {num}
            </div>
          ))}
        </div>
        <div style={styles.info}>合計: <strong>{sum}</strong> ／ スコア: <strong>{score}</strong></div>
        <div
          style={{
            ...styles.info,
            color: timeLeft <= 10 ? "#ff4757" : "#2f3542",
          }}
        >
          残り時間: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
        <div style={{ marginTop: 10, fontWeight: "bold", color: "#2f3542" }}>
          {message}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f2f6",
    userSelect: "none",
  },
  container: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
    border: "2px solid #ccc",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    textAlign: "center",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#2f3542",
    userSelect: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
    gap: 10,
    marginTop: 20,
  },
  cell: {
    width: 60,
    height: 60,
    fontSize: 24,
    fontWeight: "bold",
    borderRadius: 10,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    touchAction: "none",
  },
  info: {
    marginTop: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    padding: "10px 20px",
    fontSize: 16,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#2ed573",
    color: "white",
    cursor: "pointer",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3742fa",
  },
  text: {
    fontSize: 18,
    color: "#2f3542",
    marginTop: 10,
  },
};
