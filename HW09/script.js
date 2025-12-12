// ===== 遊戲主變數 =====
let board = Array(9).fill(null); // 棋盤狀態
let current = 'X';               // 當前玩家（玩家為 X）
let active = true;               // 控制遊戲是否進行中

// ===== 初始化棋盤 =====
function init() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  board = Array(9).fill(null);
  active = true;
  current = 'X';

  document.getElementById('status').innerText = '玩家 (X) 先手';

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

  setTimeout(computerMove, 200); // 電腦思考時間
}

// ===== 電腦 AI 下棋（Minimax） =====
function computerMove() {
  const bestMove = minimax(board, 'O').index;
  board[bestMove] = 'O';
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

// ===== Minimax 演算法 =====
function minimax(newBoard, player) {
  const availSpots = newBoard.map((v,i)=>v?null:i).filter(v=>v!==null);

  if (checkWin('X')) return {score:-10};
  if (checkWin('O')) return {score:10};
  if (availSpots.length===0) return {score:0};

  const moves = [];

  for (let i=0;i<availSpots.length;i++){
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    if(player==='O'){
      move.score = minimax(newBoard,'X').score;
    } else {
      move.score = minimax(newBoard,'O').score;
    }

    newBoard[availSpots[i]] = null;
    moves.push(move);
  }

  let bestMove;
  if(player==='O'){
    let bestScore=-Infinity;
    for(let i=0;i<moves.length;i++){
      if(moves[i].score>bestScore){
        bestScore=moves[i].score;
        bestMove=i;
      }
    }
  } else {
    let bestScore=Infinity;
    for(let i=0;i<moves.length;i++){
      if(moves[i].score<bestScore){
        bestScore=moves[i].score;
        bestMove=i;
      }
    }
  }

  return moves[bestMove];
}

// ===== 更新畫面 =====
function updateBoard() {
  const cells = document.getElementsByClassName('cell');
  for (let i = 0; i < 9; i++) {
    cells[i].classList.remove('x','o');
    if(board[i]==='X') cells[i].classList.add('x');
    else if(board[i]==='O') cells[i].classList.add('o');
    else cells[i].innerText = '';
  }
}

// ===== 判斷勝利 =====
function checkWin(player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(([a,b,c])=>board[a]===player && board[b]===player && board[c]===player);
}

// ===== 判斷是否平手 =====
function isFull() {
  return board.every(cell=>cell!==null);
}

// ===== 結束遊戲 =====
function endGame(message){
  document.getElementById('status').innerText = message;
  active=false;
}

// ===== 重開一局 =====
function resetGame(){ init(); }

// ===== 初始化 =====
init();
