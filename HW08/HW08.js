// === 初始變數 ===
const boardEl = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const btnReset = document.getElementById('reset');
const btnResetAll = document.getElementById('reset-all');
const turnEl = document.getElementById('turn');
const stateEl = document.getElementById('state');

// 計分板元素
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');

// 遊戲狀態變數
let board, current, active;

// 計分用變數
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

// === 三格成直線狀態 ===
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6]             // diagonals
];

// === 起始函式 ===
function init() {
  board = Array(9).fill('');
  current = 'X';
  active = true;

  cells.forEach(c => {
    c.textContent = '';
    c.className = 'cell';
    c.disabled = false;
  });

  turnEl.textContent = current;
  stateEl.textContent = '';
}

// === 下棋 ===
function place(idx) {
  if (!active || board[idx]) return;

  board[idx] = current;
  const cell = cells[idx];

  cell.textContent = current;
  cell.classList.add(current.toLowerCase());

  const result = evaluate();

  if (result.finished) {
    endGame(result);
  } else {
    switchTurn();
  }
}

// === 換手函式 ===
function switchTurn() {
  current = current === 'X' ? 'O' : 'X';
  turnEl.textContent = current;
}

// === 計算是否連線 ===
function evaluate() {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { finished: true, winner: board[a], line };
    }
  }

  if (board.every(v => v)) {
    return { finished: true, winner: null };
  }

  return { finished: false };
}

// === 結束遊戲 ===
function endGame({ winner, line }) {
  active = false;

  if (winner) {
    stateEl.textContent = `${winner} 勝利！`;

    // 勝利格子效果 + 動畫
    line.forEach(i => {
      const cell = cells[i];
      cell.classList.add('win', 'flash');

      // 監聽動畫結束，移除 flash class
      cell.addEventListener('animationend', () => cell.classList.remove('flash'), { once: true });
    });

    // 更新分數
    if (winner === 'X') scoreX++;
    else scoreO++;
  } else {
    stateEl.textContent = '平手';
    scoreDraw++;
  }

  // 更新計分板
  updateScoreboard();

  // 鎖定棋盤
  cells.forEach(c => c.disabled = true);
}

// === 更新計分板 ===
function updateScoreboard() {
  scoreXEl.textContent = scoreX;
  scoreOEl.textContent = scoreO;
  scoreDrawEl.textContent = scoreDraw;
}

// === 註冊按鍵事件 ===
cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const idx = +cell.getAttribute('data-idx');
    place(idx);
  });
});

// 重開遊戲（保留分數）
btnReset.addEventListener('click', init);

// 重置計分（連同遊戲）
btnResetAll.addEventListener('click', () => {
  scoreX = scoreO = scoreDraw = 0;
  updateScoreboard();
  init();
});

// === 遊戲開始 ===
init();

