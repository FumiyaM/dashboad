/**
 * オセロゲームのテスト
 * Othello Game Tests
 */

// Node.js環境でのテスト用（ブラウザでは無視される）
let OthelloGame;
if (typeof require !== 'undefined') {
    OthelloGame = require('./othello.js');
}

function runTests() {
    console.log('=== オセロゲームのテスト開始 ===\n');
    
    let testCount = 0;
    let passedCount = 0;
    
    function test(description, testFunction) {
        testCount++;
        try {
            testFunction();
            console.log(`✓ ${description}`);
            passedCount++;
        } catch (error) {
            console.log(`✗ ${description}: ${error.message}`);
        }
    }
    
    function assertEquals(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`Expected ${expected}, but got ${actual}. ${message}`);
        }
    }
    
    function assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(`Expected true, but got false. ${message}`);
        }
    }
    
    function assertFalse(condition, message = '') {
        if (condition) {
            throw new Error(`Expected false, but got true. ${message}`);
        }
    }
    
    // テスト1: ゲームの初期化
    test('ゲームの初期化', () => {
        const game = new OthelloGame();
        
        // ボードサイズのチェック
        assertEquals(game.board.length, 8, 'ボードの行数');
        assertEquals(game.board[0].length, 8, 'ボードの列数');
        
        // 初期配置のチェック
        assertEquals(game.board[3][3], game.WHITE, '(3,3)は白');
        assertEquals(game.board[3][4], game.BLACK, '(3,4)は黒');
        assertEquals(game.board[4][3], game.BLACK, '(4,3)は黒');
        assertEquals(game.board[4][4], game.WHITE, '(4,4)は白');
        
        // 初期プレイヤーのチェック
        assertEquals(game.currentPlayer, game.BLACK, '黒が先手');
        assertFalse(game.gameOver, 'ゲームは開始状態');
    });
    
    // テスト2: 石の数の計算
    test('石の数の計算', () => {
        const game = new OthelloGame();
        const count = game.countPieces();
        
        assertEquals(count.black, 2, '初期状態で黒石は2個');
        assertEquals(count.white, 2, '初期状態で白石は2個');
    });
    
    // テスト3: 有効な手の検証
    test('有効な手の検証', () => {
        const game = new OthelloGame();
        
        // 初期状態で有効な手をチェック
        assertTrue(game.isValidMove(2, 3, game.BLACK), '(2,3)は有効な手');
        assertTrue(game.isValidMove(3, 2, game.BLACK), '(3,2)は有効な手');
        assertTrue(game.isValidMove(4, 5, game.BLACK), '(4,5)は有効な手');
        assertTrue(game.isValidMove(5, 4, game.BLACK), '(5,4)は有効な手');
        
        // 無効な手をチェック
        assertFalse(game.isValidMove(0, 0, game.BLACK), '(0,0)は無効な手');
        assertFalse(game.isValidMove(3, 3, game.BLACK), '既に石がある位置は無効');
        assertFalse(game.isValidMove(-1, 0, game.BLACK), '範囲外は無効');
        assertFalse(game.isValidMove(8, 0, game.BLACK), '範囲外は無効');
    });
    
    // テスト4: 石を置く動作
    test('石を置く動作', () => {
        const game = new OthelloGame();
        
        // 有効な手を実行
        assertTrue(game.makeMove(2, 3), '有効な手は成功する');
        assertEquals(game.board[2][3], game.BLACK, '石が正しく配置される');
        assertEquals(game.board[3][3], game.BLACK, '相手の石がひっくり返る');
        
        // プレイヤーが交代することを確認
        assertEquals(game.currentPlayer, game.WHITE, 'プレイヤーが交代する');
        
        // 無効な手は失敗する
        assertFalse(game.makeMove(0, 0), '無効な手は失敗する');
    });
    
    // テスト5: 石のひっくり返し
    test('石のひっくり返し', () => {
        const game = new OthelloGame();
        
        // 黒が(2,3)に置く
        game.makeMove(2, 3);
        const count1 = game.countPieces();
        assertEquals(count1.black, 4, '黒石が増える');
        assertEquals(count1.white, 1, '白石が減る');
        
        // 白が(2,2)に置く
        game.makeMove(2, 2);
        const count2 = game.countPieces();
        assertEquals(count2.black, 3, '黒石が減る');
        assertEquals(count2.white, 3, '白石が増える');
    });
    
    // テスト6: 有効な手の取得
    test('有効な手の取得', () => {
        const game = new OthelloGame();
        const validMoves = game.getValidMoves(game.BLACK);
        
        assertEquals(validMoves.length, 4, '初期状態で黒は4つの有効な手がある');
        
        // 有効な手の座標をチェック
        const expectedMoves = [[2, 3], [3, 2], [4, 5], [5, 4]];
        expectedMoves.forEach(([row, col]) => {
            assertTrue(
                validMoves.some(([r, c]) => r === row && c === col),
                `(${row},${col})が有効な手に含まれている`
            );
        });
    });
    
    // テスト7: ゲーム終了の検出
    test('ゲーム終了の検出', () => {
        const game = new OthelloGame();
        
        // 初期状態では終了していない
        assertFalse(game.gameOver, '初期状態では終了していない');
        
        // ボードを埋めて強制的に終了状態にする
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (game.board[row][col] === game.EMPTY) {
                    game.board[row][col] = game.BLACK;
                }
            }
        }
        game.checkGameOver();
        assertTrue(game.gameOver, 'ボードが埋まると終了する');
    });
    
    // テスト8: 勝者の判定
    test('勝者の判定', () => {
        const game = new OthelloGame();
        
        // ゲーム中は勝者なし
        assertEquals(game.getWinner(), null, 'ゲーム中は勝者なし');
        
        // 強制的にゲーム終了状態にする
        game.gameOver = true;
        
        // 黒が多い状態
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                game.board[row][col] = row < 5 ? game.BLACK : game.WHITE;
            }
        }
        assertEquals(game.getWinner(), game.BLACK, '黒が多い場合は黒の勝ち');
        
        // 白が多い状態
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                game.board[row][col] = row < 3 ? game.BLACK : game.WHITE;
            }
        }
        assertEquals(game.getWinner(), game.WHITE, '白が多い場合は白の勝ち');
        
        // 引き分け状態
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                game.board[row][col] = (row + col) % 2 === 0 ? game.BLACK : game.WHITE;
            }
        }
        assertEquals(game.getWinner(), 'draw', '同数の場合は引き分け');
    });
    
    // テスト結果の表示
    console.log(`\n=== テスト結果 ===`);
    console.log(`実行: ${testCount}, 成功: ${passedCount}, 失敗: ${testCount - passedCount}`);
    
    if (passedCount === testCount) {
        console.log('✓ すべてのテストが成功しました！');
    } else {
        console.log(`✗ ${testCount - passedCount}個のテストが失敗しました。`);
    }
    
    return passedCount === testCount;
}

// テストの実行
if (typeof window === 'undefined') {
    // Node.js環境
    runTests();
} else {
    // ブラウザ環境
    console.log('ブラウザのコンソールでrunTests()を実行してテストを開始してください。');
}