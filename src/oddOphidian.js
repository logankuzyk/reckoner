const Board = require('./board');

class OddOphidian {
  constructor(apiRequest) {
    this.minMaxDepth = 3;
    this.board = new Board(apiRequest);
    this.head = this.board.grid.get(this.board.snakes.get('me').body[0]);
    this.possibleMoves = ['left', 'right', 'up', 'down'];
    this.move = this.weighTheConsequences();
  }

  evaluatePosition(board) {
    let me = board.snakes.get('me');

    let snake = board.snakes.values();
    let targetSnake;
    let scarySnakeTail;
    let score;

    while (!snake.done) {
      if (snake.value.length + 1 < me.length) {
        targetSnake = snake.body[0];
        break;
      } else {
        scarySnakeTail = snake.body[snake.body.length - 1];
      }
    }

    // only looks at first food right now. can change to closest food in the future (change food storage technique)
    let turnsUntilFood = board.lengthOfPath(me.body[0], board.food[0]);
    let turnsUntilTail = board.lengthOfPath(
      me.body[0],
      me.body[me.body.length - 1],
    );
    let turnsUntilKill;
    let turnsUntilOtherTail;

    if (targetSnake) {
      turnsUntilKill = board.lengthOfPath(me.body[0], targetSnake);
    }
    if (scarySnakeTail) {
      turnsUntilOtherTail = board.lengthOfPath(me.body[0], scarySnakeTail);
    }

    score = -(
      turnsUntilFood +
      turnsUntilTail +
      turnsUntilKill +
      turnsUntilOtherTail
    );

    return score;
  }

  // board: game board representing a possible move sequence (instanceof Board)
  // position: new head position of given snake
  // snakeId: ID of snake that moved in the last turn.
  // depth: maximum depth of move tree.
  // alpha/beta: for pruning.
  // maximizing: maximizing or minimizing? a.k.a is it "my turn" or theirs? (boolean)
  minMax(board, position, snakeId, depth, alpha, beta, maximizing) {
    if (depth === 0) {
      // return static evaluation
      return this.evaluatePosition(board);
    } else if (position == null || this.board.grid.get(position).solid) {
      // move was suicidal
      return -Infinity;
    }

    // make copy of board that gets moved forward.
    let newBoard = Object.assign(
      Object.create(Object.getPrototypeOf(board)),
      board,
    );
    newBoard.snakes.get(snakeId).pop();

    if (maximizing) {
      // me trying to make the best choice
      let maxEval = -Infinity;
      for (let move of this.possibleMoves) {
        let eval = this.minMax(
          board,
          board.grid.get(board.snakes.get('me').body[0])[move],
          'me',
          depth - 1,
          alpha,
          beta,
          false,
        );
        maxEval = Math.max(maxEval, eval);
        alpha = Math.max(alpha, eval);
        if (beta <= alpha) {
          break;
        }
      }
      return maxEval;
    } else {
      // other snakes tryna mess with the king
      let minEval = Infinity;
      board.snakes.forEach((snake, snakeId) => {
        for (let move of this.possibleMoves) {
          let eval = this.minMax(
            board,
            board.grid.get(snake.body[0])[move],
            snakeId,
            depth - 1,
            alpha,
            beta,
            true,
          );
          minEval = Math.min(minEval, eval);
        }
      });
      return minEval;
    }
  }

  weighTheConsequences() {
    let bestMove;
    let maxEval = -Infinity;

    for (let move of this.possibleMoves) {
      let eval = this.minMax(
        this.board,
        this.board.grid.get(this.head[move]),
        'me',
        this.minMaxDepth,
        -Infinity,
        Infinity,
        false,
      );
      if (eval > maxEval) {
        maxEval = eval;
        bestMove = move;
      }
    }

    return bestMove;
  }
}

module.exports = OddOphidian;
