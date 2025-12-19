let SIZE = 8;
let board = [];
let current = 1; // 1: 玩家黑, 2: 電腦白
let isProcessing = false;
let difficulty = 'easy'; // 預設簡單

const DIRS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
];

// ---------------- 初始化棋盤 ----------------
function initBoard() {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    const mid = SIZE / 2;
    board[mid - 1][mid - 1] = 2;
    board[mid][mid] = 2;
    board[mid - 1][mid] = 1;
    board[mid][mid - 1] = 1;
}

// ---------------- 判斷合法範圍 ----------------
function inBounds(r, c) { return r >= 0 && r < SIZE && c >= 0 && c < SIZE; }

// ---------------- 取得合法走法 ----------------
function getValidMoves(color) {
    const moves = new Map();
    const opp = (color === 1 ? 2 : 1);

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] !== 0) continue;
            let totalFlips = [];
            for (const [dr, dc] of DIRS) {
                let rr = r + dr, cc = c + dc;
                let flips = [];
                while (inBounds(rr, cc) && board[rr][cc] === opp) {
                    flips.push([rr, cc]); rr += dr; cc += dc;
                }
                if (flips.length > 0 && inBounds(rr, cc) && board[rr][cc] === color) {
                    totalFlips = totalFlips.concat(flips);
                }
            }
            if (totalFlips.length > 0) moves.set(`${r},${c}`, totalFlips);
        }
    }
    return moves;
}

// ---------------- 下棋並翻棋動畫 ----------------
function applyMove(r, c, color, flips) {
    board[r][c] = color;
    const td = document.querySelector(`#board td[data-r='${r}'][data-c='${c}']`);
    if (td) {
        const disc = document.createElement('div');
        disc.className = 'disc ' + (color === 1 ? 'black' : 'white');
        disc.classList.add('flip');
        td.appendChild(disc);
        setTimeout(() => disc.classList.remove('flip'), 300);
    }

    flips.forEach(([rr, cc], idx) => {
        setTimeout(() => {
            board[rr][cc] = color;
            const flipTd = document.querySelector(`#board td[data-r='${rr}'][data-c='${cc}']`);
            if (flipTd && flipTd.firstChild) {
                const disc = flipTd.firstChild;
                disc.classList.add('flip');
                setTimeout(() => {
                    disc.classList.remove('flip');
                    disc.className = 'disc ' + (color === 1 ? 'black' : 'white');
                }, 300);
            }

            if (idx === flips.length - 1) {
                isProcessing = false;
                updateUI();
            }
        }, idx * 200);
    });

    if (flips.length === 0) {
        isProcessing = false;
        updateUI();
    }
}

// ---------------- 渲染棋盤 ----------------
function renderBoard() {
    const table = document.getElementById('board');
    table.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < SIZE; c++) {
            const td = document.createElement('td');
            td.className = 'cell';
            td.dataset.r = r;
            td.dataset.c = c;
            td.addEventListener('click', onCellClick);

            if (board[r][c] !== 0) {
                const disc = document.createElement('div');
                disc.className = 'disc ' + (board[r][c] === 1 ? 'black' : 'white');
                td.appendChild(disc);
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    updateUI();
}

// ---------------- 更新 UI ----------------
function updateUI() {
    document.querySelectorAll('#board td').forEach(td => td.classList.remove('valid-move'));

    if (current === 1 && !isProcessing) {
        const moves = getValidMoves(1);
        for (const key of moves.keys()) {
            const [r, c] = key.split(',').map(Number);
            const td = document.querySelector(`#board td[data-r='${r}'][data-c='${c}']`);
            if (td) td.classList.add('valid-move');
        }
    }

    const blackScore = board.flat().filter(x => x === 1).length;
    const whiteScore = board.flat().filter(x => x === 2).length;
    document.getElementById('blackScore').textContent = blackScore;
    document.getElementById('whiteScore').textContent = whiteScore;
    document.getElementById('turnInfo').textContent = (current === 1 ? '輪到：黑 (●)' : '輪到：白 (○)');

    checkGameEnd();
}

// ---------------- 玩家點擊事件 ----------------
function onCellClick() {
    if (current !== 1 || isProcessing) return;
    const r = Number(this.dataset.r);
    const c = Number(this.dataset.c);
    const moves = getValidMoves(1);
    const key = `${r},${c}`;
    if (!moves.has(key)) return;

    isProcessing = true;
    const flips = moves.get(key);
    applyMove(r, c, 1, flips);
    current = 2;

    setTimeout(() => computerMove(), 600);
}

// ---------------- 電腦下棋 ----------------
function computerMove() {
    const moves = getValidMoves(2);
    if (moves.size === 0) {
        const playerMoves = getValidMoves(1);
        if (playerMoves.size === 0) { checkGameEnd(); isProcessing = false; return; }
        document.getElementById('status').textContent = '電腦無合法招，跳過回合';
        current = 1; updateUI(); isProcessing = false;
        return;
    }

    let choice;
    if (difficulty === 'easy') {
        const keys = Array.from(moves.keys());
        choice = keys[Math.floor(Math.random() * keys.length)];
    } else {
        // greedy + 角落優先
        const keys = Array.from(moves.keys());
        let bestScore = -1;
        keys.forEach(k => {
            const flips = moves.get(k);
            const [r, c] = k.split(',').map(Number);
            let score = flips.length;
            if ((r === 0 && c === 0) || (r === 0 && c === 7) || (r === 7 && c === 0) || (r === 7 && c === 7)) score += 10;
            if (score > bestScore) { bestScore = score; choice = k; }
        });
    }

    const [r, c] = choice.split(',').map(Number);
    const flips = moves.get(choice);
    applyMove(r, c, 2, flips);

    current = 1;
    updateUI();
    isProcessing = false;
}

// ---------------- 遊戲結束判定 ----------------
function checkGameEnd() {
    const blackScore = board.flat().filter(x => x === 1).length;
    const whiteScore = board.flat().filter(x => x === 2).length;
    const movesBlack = getValidMoves(1).size;
    const movesWhite = getValidMoves(2).size;

    if ((movesBlack === 0 && movesWhite === 0) || board.flat().every(x => x !== 0)) {
        let result = '';
        if (blackScore > whiteScore) result = `黑方獲勝！ ${blackScore}:${whiteScore}`;
        else if (whiteScore > blackScore) result = `白方獲勝！ ${whiteScore}:${blackScore}`;
        else result = `平手 ${blackScore}:${whiteScore}`;
        document.getElementById('status').textContent = '遊戲結束：' + result;
        document.querySelectorAll('#board td').forEach(td => td.removeEventListener('click', onCellClick));
        isProcessing = false;
    }
}

// ---------------- 切換難度 ----------------
function setDifficulty(level) {
    if (isProcessing) {
        document.getElementById('status').textContent = '動畫中無法切換難度，請稍候';
        return;
    }
    difficulty = level;
    document.getElementById('status').textContent = `已切換到 ${level === 'easy' ? '簡單' : '困難'} 模式`;
}

// ---------------- 重新開始 ----------------
function restart() {
    initBoard();
    current = 1;
    document.getElementById('status').textContent = '';
    renderBoard();
    isProcessing = false;
}

// ---------------- 初始化 ----------------
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('restartBtn').addEventListener('click', restart);
    initBoard();
    renderBoard();
});
