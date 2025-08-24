/**
 * オセロ（リバーシ）ゲームのロジック実装
 * Othello (Reversi) Game Logic Implementation
 */

class OthelloGame {
    constructor() {
        this.BOARD_SIZE = 8;
        this.EMPTY = 0;
        this.BLACK = 1;
        this.WHITE = 2;
        
        // ボードの初期化
        this.board = this.initializeBoard();
        this.currentPlayer = this.BLACK; // 黒が先手
        this.gameOver = false;
        
        // 8方向の移動ベクトル
        this.directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
    }
    
    /**
     * ボードを初期状態に設定
     */
    initializeBoard() {
        const board = Array(this.BOARD_SIZE).fill(null)
            .map(() => Array(this.BOARD_SIZE).fill(this.EMPTY));
        
        // 初期配置（中央4マス）
        const center = Math.floor(this.BOARD_SIZE / 2);
        board[center - 1][center - 1] = this.WHITE;
        board[center - 1][center] = this.BLACK;
        board[center][center - 1] = this.BLACK;
        board[center][center] = this.WHITE;
        
        return board;
    }
    
    /**
     * 指定した位置が有効な座標かチェック
     */
    isValidPosition(row, col) {
        return row >= 0 && row < this.BOARD_SIZE && 
               col >= 0 && col < this.BOARD_SIZE;
    }
    
    /**
     * 指定した方向に相手の石を挟めるかチェック
     */
    canFlipInDirection(row, col, direction, player) {
        const [dRow, dCol] = direction;
        let currentRow = row + dRow;
        let currentCol = col + dCol;
        let foundOpponent = false;
        
        while (this.isValidPosition(currentRow, currentCol)) {
            const cell = this.board[currentRow][currentCol];
            
            if (cell === this.EMPTY) {
                return false; // 空きマスに到達
            }
            
            if (cell === player) {
                return foundOpponent; // 自分の石に到達、相手の石を挟めるか
            }
            
            // 相手の石
            foundOpponent = true;
            currentRow += dRow;
            currentCol += dCol;
        }
        
        return false;
    }
    
    /**
     * 指定した位置に石を置けるかチェック
     */
    isValidMove(row, col, player) {
        if (!this.isValidPosition(row, col) || 
            this.board[row][col] !== this.EMPTY) {
            return false;
        }
        
        // どの方向でも相手の石を挟める場合は有効な手
        return this.directions.some(direction => 
            this.canFlipInDirection(row, col, direction, player)
        );
    }
    
    /**
     * 指定した方向の石をひっくり返す
     */
    flipInDirection(row, col, direction, player) {
        const [dRow, dCol] = direction;
        let currentRow = row + dRow;
        let currentCol = col + dCol;
        const toFlip = [];
        
        while (this.isValidPosition(currentRow, currentCol)) {
            const cell = this.board[currentRow][currentCol];
            
            if (cell === this.EMPTY) {
                break;
            }
            
            if (cell === player) {
                // 自分の石に到達、挟んだ石をひっくり返す
                toFlip.forEach(([r, c]) => {
                    this.board[r][c] = player;
                });
                break;
            }
            
            toFlip.push([currentRow, currentCol]);
            currentRow += dRow;
            currentCol += dCol;
        }
    }
    
    /**
     * 石を置く
     */
    makeMove(row, col) {
        if (this.gameOver || !this.isValidMove(row, col, this.currentPlayer)) {
            return false;
        }
        
        // 石を置く
        this.board[row][col] = this.currentPlayer;
        
        // 全方向の石をひっくり返す
        this.directions.forEach(direction => {
            if (this.canFlipInDirection(row, col, direction, this.currentPlayer)) {
                this.flipInDirection(row, col, direction, this.currentPlayer);
            }
        });
        
        // プレイヤーを交代
        this.switchPlayer();
        
        // ゲーム終了チェック
        this.checkGameOver();
        
        return true;
    }
    
    /**
     * プレイヤーを交代
     */
    switchPlayer() {
        const nextPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK;
        
        // 次のプレイヤーが置ける場所があるかチェック
        if (this.getValidMoves(nextPlayer).length > 0) {
            this.currentPlayer = nextPlayer;
        } else if (this.getValidMoves(this.currentPlayer).length === 0) {
            // 両プレイヤーとも置けない場合はゲーム終了
            this.gameOver = true;
        }
        // 現在のプレイヤーのみ置ける場合は交代しない
    }
    
    /**
     * 指定したプレイヤーの有効な手を取得
     */
    getValidMoves(player) {
        const validMoves = [];
        
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if (this.isValidMove(row, col, player)) {
                    validMoves.push([row, col]);
                }
            }
        }
        
        return validMoves;
    }
    
    /**
     * ゲーム終了チェック
     */
    checkGameOver() {
        const blackMoves = this.getValidMoves(this.BLACK);
        const whiteMoves = this.getValidMoves(this.WHITE);
        
        if (blackMoves.length === 0 && whiteMoves.length === 0) {
            this.gameOver = true;
        }
    }
    
    /**
     * 石の数を数える
     */
    countPieces() {
        let blackCount = 0;
        let whiteCount = 0;
        
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if (this.board[row][col] === this.BLACK) {
                    blackCount++;
                } else if (this.board[row][col] === this.WHITE) {
                    whiteCount++;
                }
            }
        }
        
        return { black: blackCount, white: whiteCount };
    }
    
    /**
     * 勝者を取得
     */
    getWinner() {
        if (!this.gameOver) {
            return null;
        }
        
        const { black, white } = this.countPieces();
        
        if (black > white) {
            return this.BLACK;
        } else if (white > black) {
            return this.WHITE;
        } else {
            return 'draw';
        }
    }
    
    /**
     * ゲーム状態を文字列で表示（デバッグ用）
     */
    printBoard() {
        console.log('  0 1 2 3 4 5 6 7');
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            let rowStr = row + ' ';
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const cell = this.board[row][col];
                if (cell === this.EMPTY) {
                    rowStr += '. ';
                } else if (cell === this.BLACK) {
                    rowStr += '● ';
                } else {
                    rowStr += '○ ';
                }
            }
            console.log(rowStr);
        }
        
        const { black, white } = this.countPieces();
        console.log(`黒: ${black}, 白: ${white}`);
        console.log(`現在のプレイヤー: ${this.currentPlayer === this.BLACK ? '黒' : '白'}`);
        console.log(`ゲーム終了: ${this.gameOver}`);
    }
}

// Node.js環境での使用のためのエクスポート（ブラウザでは無視される）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OthelloGame;
}