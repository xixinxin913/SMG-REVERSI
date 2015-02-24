  'use strict';

/** Define the board with max row and col number */
var maxRow = 10;
var maxCol = 10;

angular.module('myApp', []).factory('gameLogic', function() {

  /** Returns the initial TicTacToe board, which is a 3x3 matrix containing ''. */
  function getInitialBoard() {
    return [['', '', '', '', '', '',  '',  '',  '',  ''],
            ['', '', '', '', '', '',  '',  '',  '',  ''],
            ['', '', '', '', '', '',  '',  '',  '',  ''],
            ['', '', '', '', '', '',  '',  '',  '',  ''],
            ['', '', '', '', 'X', 'O',  '',  '',  '',  ''],
            ['', '', '', '', 'O', 'X',  '',  '',  '',  ''],
            ['', '', '', '', '', '',  '',  '',  '',  ''],
            ['', '', '', '', '', '',  '',  '',  '',  ''],
            ['', '', '', '', '', '',  '',  '',  '',  ''],
            ['', '', '', '', '', '',  '',  '',  '',  '']];
  }

  /**
   * Returns true if the game ended in a tie because there are no empty cells.
   * E.g., isTie returns true for the following board:
   *     [['X', 'O', 'X'],
   *      ['X', 'O', 'O'],
   *      ['O', 'X', 'X']]
   */
  function isEnd(board) {
    var i, j;
    for (i = 0; i < maxRow; i++) {
      for (j = 0; j < maxCol; j++) {
        if (board[i][j] === '') {
          // If there is an empty cell then we do not have a tie.
          return false;
        }
      }
    }
    // No empty cells, so we have a tie!
    return true;
  }

  /**
   * Return the winner (either 'X' or 'O') or '' if there is no winner.
   * The board is a matrix of size 10x10 containing either 'X', 'O', or ''.
   * the winner get more pawns on the board when the board is full (end of the game)
   */
  function getWinner(board) {
    var Xcount = 0;
    var Ocount = 0;
    var i, j;
    for (i = 0; i < maxRow; i++) {
      for (j = 0; j < maxCol; j++) {
         Xcount += ( board[i][j] === 'X' ? 1 :0 );
         Ocount += ( board[i][j] === 'O' ? 1 :0 );
      }
    }
    if (Xcount > Ocount)) {
        return 'X';
      }
    if (Xcount < Ocount) {
        return 'O';
      }
    }
    return '';
  }

  /**
   * Returns all the possible moves for the given board and turnIndexBeforeMove.
   * Returns an empty array if the game is over.
   */
  function getPossibleMoves(board, turnIndexBeforeMove) {
    var possibleMoves = [];
    var i, j;
    for (i = 0; i < 3; i++) {
      for (j = 0; j < 3; j++) {
        try {
          possibleMoves.push(createMove(board, i, j, turnIndexBeforeMove));
        } catch (e) {
          // The cell in that position was full.
        }
      }
    }
    return possibleMoves;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  function createMove(board, row, col, turnIndexBeforeMove) {
    if (board === undefined) {
      // Initially (at the beginning of the match), the board in state is undefined.
      board = getInitialBoard();
    }
    if (board[row][col] !== '') {
      throw new Error("One can only make a move in an empty position!");
    }
    if (getWinner(board) !== '' || isEnd(board)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    var boardAfterMove = angular.copy(board);
    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
    var winner = getWinner(boardAfterMove);
    var firstOperation;
    if (winner !== '' || isEnd(boardAfterMove)) {
      // Game over.
      firstOperation = {endMatch: {endMatchScores:
        (winner === 'X' ? [1, 0] : (winner === 'O' ? [0, 1] : [0, 0]))}};
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
    }
    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: {row: row, col: col}}}];
  }

  function isMoveOk(params) {
    var move = params.move;
    var turnIndexBeforeMove = params.turnIndexBeforeMove;
    var stateBeforeMove = params.stateBeforeMove;
    // The state and turn after move are not needed in TicTacToe (or in any game where all state is public).
    //var turnIndexAfterMove = params.turnIndexAfterMove;
    //var stateAfterMove = params.stateAfterMove;

    // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
    // to verify that move is legal.
    try {
      // Example move:
      // [{setTurn: {turnIndex : 1},
      //  {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
      //  {set: {key: 'delta', value: {row: 0, col: 0}}}]
      var deltaValue = move[2].set.value;
      var row = deltaValue.row;
      var col = deltaValue.col;
      var board = stateBeforeMove.board;
      var expectedMove = createMove(board, row, col, turnIndexBeforeMove);
      if (!angular.equals(move, expectedMove)) {
        return false;
      }
    } catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return true;
  }

  return {
      getInitialBoard: getInitialBoard,
      getPossibleMoves: getPossibleMoves,
      createMove: createMove,
      isMoveOk: isMoveOk
  };
});

