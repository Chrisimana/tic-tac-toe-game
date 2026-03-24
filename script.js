const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const resetButton = document.getElementById("reset");
const modeSelect = document.getElementById("mode");
const difficultySelect = document.getElementById("difficulty");

let board = Array(9).fill(null);
let currentPlayer = "X";
let playing = true;
let mode = "2p";
let difficulty = "easy";

const winningPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function setDifficultyAvailability() {
  difficultySelect.disabled = mode !== "1p";
}

function updateStatus(message, color = "var(--accent)") {
  statusElement.textContent = message;
  statusElement.style.color = color;
}

function renderBoard() {
  boardElement.innerHTML = "";
  board.forEach((value, index) => {
    const cell = document.createElement("button");
    cell.className = "cell" + (value ? " disabled" : "");
    cell.setAttribute("data-index", index);
    cell.disabled = !playing || Boolean(value);

    const content = document.createElement("div");
    content.className = "cell-content";
    content.textContent = value || "";

    cell.appendChild(content);
    cell.addEventListener("click", () => onCellClick(index));
    boardElement.appendChild(cell);
  });
}

function onCellClick(index) {
  if (!playing || board[index] !== null) return;
  if (mode === "1p" && currentPlayer !== "X") return;

  board[index] = currentPlayer;
  renderBoard();

  if (processTurn()) return;

  if (mode === "1p" && playing && currentPlayer === "O") {
    setTimeout(aiMove, 180);
  }
}

function processTurn() {
  const winner = getWinner();
  if (winner) {
    playing = false;
    updateStatus(`Pemenang: ${winner}`, "var(--danger)");
    return true;
  }

  if (!board.includes(null)) {
    playing = false;
    updateStatus("Hasil: Seri", "#555");
    return true;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus(`Giliran: ${currentPlayer}`);
  return false;
}

function getWinner(boardState = board) {
  for (const pattern of winningPatterns) {
    const [a, b, c] = pattern;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[b] === boardState[c]) {
      return boardState[a];
    }
  }
  return null;
}

function aiMove() {
  if (!playing) return;

  const index = getAIMove();
  if (index === null) return;

  board[index] = "O";
  renderBoard();

  if (processTurn()) return;

  // selanjutnya giliran player X
}

function getAIMove() {
  const emptyCells = board.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);
  if (emptyCells.length === 0) return null;

  const level = difficulty;
  if (level === "easy") {
    return randomChoice(emptyCells);
  }

  if (level === "medium") {
    if (Math.random() < 0.5) {
      return randomChoice(emptyCells);
    }
    return minimaxMove("O").index;
  }

  // hard
  return minimaxMove("O").index;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function minimaxMove(player) {
  const opponent = player === "O" ? "X" : "O";
  const winner = getWinner(board);
  if (winner === "X") return { score: -10 };
  if (winner === "O") return { score: 10 };
  if (!board.includes(null)) return { score: 0 };

  const moves = [];

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = player;
      const result = minimaxMove(opponent);
      moves.push({ index: i, score: result.score });
      board[i] = null;
    }
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (const move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;
    for (const move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }

  return bestMove || { index: null, score: 0 };
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  playing = true;
  mode = modeSelect.value;
  difficulty = difficultySelect.value;
  setDifficultyAvailability();
  updateStatus("Giliran: X");
  renderBoard();

  if (mode === "1p" && currentPlayer === "O") {
    setTimeout(aiMove, 180);
  }
}

modeSelect.addEventListener("change", (event) => {
  mode = event.target.value;
  setDifficultyAvailability();
  resetGame();
});

difficultySelect.addEventListener("change", (event) => {
  difficulty = event.target.value;
  resetGame();
});

resetButton.addEventListener("click", resetGame);

setDifficultyAvailability();
renderBoard();
