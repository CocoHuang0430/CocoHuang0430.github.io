// ===== 遊戲主變數 =====
let board = Array(9).fill(null); // 棋盤狀態
let current = 'X';               // 當前玩家（玩家 X）
let active = true;               // 遊戲是否進行中

// ===== 初始化棋盤 =====
function init() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  board = Array(9).fill(null);
  active = true;
  current = 'X';
  document.getElementById('status').innerText = '玩家 (X) 先手';

  // 建立格子
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.onclick = () => playerMove(i);
    boardEl.appendChild(cell);
  }

  updateBoard();
}

// ===== 玩家下棋 =====
function playerMove(i) {
  if (!active || board[i]) return;

  board[i] = 'X';
  updateBoard();

  if (checkWin('X')) {
    endGame('玩家 (X) 勝利！');
    return;
  } else if (isFull()) {
    endGame('平手！');
    return;
  }

  current = 'O';
  document.getElementById('status').innerText = '電腦思考中...';
  setTimeout(computerMove, 300); // AI 思考延遲
}

// ===== 電腦 AI（Minimax） =====
function computerMove() {
  let move = bestMove(); // 使用 Minimax 算法

  board[move] = 'O';
  updateBoard();

  if (checkWin('O')) {
    endGame('電腦 (O) 勝利！');
    return;
  } else if (isFull()) {
    endGame('平手！');
    return;
  }

  current = 'X';
  document.getElementById('status').innerText = '輪到玩家 (X)';
}

// ===== Minimax 核心算法 =====
function minimax(tempBoard, depth, isMaximizing) {
  if (checkWinBoard(tempBoard, 'O')) return 10 - depth;
  if (checkWinBoard(tempBoard, 'X')) return depth - 10;
  if (tempBoard.every(cell => cell !== null)) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!tempBoard[i]) {
        tempBoard[i] = 'O';
        let evalScore = minimax(tempBoard, depth + 1, false);
        tempBoard[i] = null;
        maxEval = Math.max(maxEval, evalScore);
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!tempBoard[i]) {
        tempBoard[i] = 'X';
        let evalScore = minimax(tempBoard, depth + 1, true);
        tempBoard[i] = null;
        minEval = Math.min(minEval, evalScore);
      }
    }
    return minEval;
  }
}

// ===== 找最佳步 =====
function bestMove() {
  let bestScore = -Infinity;
  let move = null;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

// ===== 更新畫面 =====
function updateBoard() {
  const cells = document.getElementsByClassName('cell');
  for (let i = 0; i < 9; i++) {
    cells[i].classList.remove('x','o');
    if (board[i] === 'X') cells[i].classList.add('x');
    else if (board[i] === 'O') cells[i].classList.add('o');
  }
}

// ===== 判斷勝利（原 board） =====
function checkWin(player) {
  return checkWinBoard(board, player);
}

// ===== 判斷勝利（傳入任意 board） =====
function checkWinBoard(b, player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(([a,b,c]) => b[a]===player && b[b]===player && b[c]===player);
}

// ===== 判斷是否平手 =====
function isFull() {
  return board.every(cell => cell !== null);
}

// ===== 結束遊戲 =====
function endGame(msg) {
  document.getElementById('status').innerText = msg;
  active = false;
}

// ===== 重開遊戲 =====
function resetGame() {
  init();
}

// ===== 初始化 =====
init();
