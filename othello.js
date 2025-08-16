class OthelloGame {
    constructor() {
        this.board = Array(8).fill().map(() => Array(8).fill(0));
        this.currentPlayer = 1; // 1 = 黒, -1 = 白
        this.gameBoard = document.getElementById('game-board');
        this.currentPlayerDisplay = document.getElementById('current-player');
        this.blackScoreDisplay = document.getElementById('black-score');
        this.whiteScoreDisplay = document.getElementById('white-score');
        this.gameMessage = document.getElementById('game-message');
        this.resetBtn = document.getElementById('reset-btn');
        
        this.directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        // 盤面をリセット
        this.board = Array(8).fill().map(() => Array(8).fill(0));
        this.currentPlayer = 1;
        
        // 初期配置
        this.board[3][3] = -1; // 白
        this.board[3][4] = 1;  // 黒
        this.board[4][3] = 1;  // 黒
        this.board[4][4] = -1; // 白
        
        this.createBoard();
        this.updateDisplay();
        this.highlightValidMoves();
    }
    
    createBoard() {
        this.gameBoard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                
                this.gameBoard.appendChild(cell);
            }
        }
        
        this.updateBoardDisplay();
    }
    
    updateBoardDisplay() {
        const cells = this.gameBoard.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const value = this.board[row][col];
            
            // 既存のピースを削除
            cell.innerHTML = '';
            cell.classList.remove('valid-move');
            
            if (value !== 0) {
                const piece = document.createElement('div');
                piece.className = `game-piece ${value === 1 ? 'black' : 'white'}`;
                cell.appendChild(piece);
            }
        });
    }
    
    highlightValidMoves() {
        const validMoves = this.getValidMoves(this.currentPlayer);
        
        validMoves.forEach(([row, col]) => {
            const cell = this.gameBoard.children[row * 8 + col];
            cell.classList.add('valid-move');
        });
    }
    
    getValidMoves(player) {
        const validMoves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === 0 && this.isValidMove(row, col, player)) {
                    validMoves.push([row, col]);
                }
            }
        }
        
        return validMoves;
    }
    
    isValidMove(row, col, player) {
        if (this.board[row][col] !== 0) return false;
        
        for (let [dx, dy] of this.directions) {
            if (this.checkDirection(row, col, dx, dy, player)) {
                return true;
            }
        }
        
        return false;
    }
    
    checkDirection(row, col, dx, dy, player) {
        let x = row + dx;
        let y = col + dy;
        let hasOpponentPiece = false;
        
        while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            if (this.board[x][y] === 0) {
                return false;
            } else if (this.board[x][y] === -player) {
                hasOpponentPiece = true;
            } else if (this.board[x][y] === player) {
                return hasOpponentPiece;
            }
            
            x += dx;
            y += dy;
        }
        
        return false;
    }
    
    handleCellClick(row, col) {
        if (this.board[row][col] !== 0 || !this.isValidMove(row, col, this.currentPlayer)) {
            return;
        }
        
        this.makeMove(row, col, this.currentPlayer);
        this.updateBoardDisplay();
        this.updateDisplay();
        
        // 次のプレイヤーに交代
        this.currentPlayer = -this.currentPlayer;
        
        // 次のプレイヤーの有効手をチェック
        const nextValidMoves = this.getValidMoves(this.currentPlayer);
        
        if (nextValidMoves.length === 0) {
            // 次のプレイヤーが打てない場合、現在のプレイヤーが続行
            this.currentPlayer = -this.currentPlayer;
            const currentValidMoves = this.getValidMoves(this.currentPlayer);
            
            if (currentValidMoves.length === 0) {
                // 両プレイヤーが打てない場合、ゲーム終了
                this.endGame();
                return;
            } else {
                this.gameMessage.textContent = '相手がパスしました。';
            }
        } else {
            this.gameMessage.textContent = '';
        }
        
        this.updateDisplay();
        this.highlightValidMoves();
        
        // 盤面が満杯かチェック
        if (this.isBoardFull()) {
            this.endGame();
        }
    }
    
    makeMove(row, col, player) {
        this.board[row][col] = player;
        
        for (let [dx, dy] of this.directions) {
            this.flipPieces(row, col, dx, dy, player);
        }
    }
    
    flipPieces(row, col, dx, dy, player) {
        if (!this.checkDirection(row, col, dx, dy, player)) return;
        
        let x = row + dx;
        let y = col + dy;
        const piecesToFlip = [];
        
        while (x >= 0 && x < 8 && y >= 0 && y < 8 && this.board[x][y] === -player) {
            piecesToFlip.push([x, y]);
            x += dx;
            y += dy;
        }
        
        piecesToFlip.forEach(([flipX, flipY]) => {
            this.board[flipX][flipY] = player;
        });
    }
    
    isBoardFull() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }
    
    updateDisplay() {
        const scores = this.getScore();
        this.blackScoreDisplay.textContent = scores.black;
        this.whiteScoreDisplay.textContent = scores.white;
        this.currentPlayerDisplay.textContent = this.currentPlayer === 1 ? '黒' : '白';
    }
    
    getScore() {
        let black = 0;
        let white = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === 1) {
                    black++;
                } else if (this.board[row][col] === -1) {
                    white++;
                }
            }
        }
        
        return { black, white };
    }
    
    endGame() {
        const scores = this.getScore();
        let message = '';
        
        if (scores.black > scores.white) {
            message = `ゲーム終了！黒の勝利です！ (${scores.black} - ${scores.white})`;
            this.gameMessage.className = 'winner';
        } else if (scores.white > scores.black) {
            message = `ゲーム終了！白の勝利です！ (${scores.white} - ${scores.black})`;
            this.gameMessage.className = 'winner';
        } else {
            message = `ゲーム終了！引き分けです！ (${scores.black} - ${scores.white})`;
            this.gameMessage.className = 'game-over';
        }
        
        this.gameMessage.textContent = message;
        
        // 有効手のハイライトを削除
        const cells = this.gameBoard.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('valid-move');
            cell.style.cursor = 'default';
        });
    }
    
    setupEventListeners() {
        this.resetBtn.addEventListener('click', () => {
            this.initializeGame();
            this.gameMessage.textContent = '';
            this.gameMessage.className = '';
        });
    }
}

// ゲームを開始
document.addEventListener('DOMContentLoaded', () => {
    new OthelloGame();
});