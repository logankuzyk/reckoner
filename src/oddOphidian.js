const Board = require('./board');

class OddOphidian {
  constructor(apiRequest) {
    this.minMaxDepth = 1;
    this.board = new Board(apiRequest);
    this.head = this.board.grid.get(this.board.snakes.get('me').body[0]);
    this.possibleMoves = ['left', 'right', 'up', 'down'];
    this.move = this.weighTheConsequences();
  }

  evaluatePosition(board) {
    let me = board.snakes.get('me');

    let iterator = board.snakes.values();
    let targetSnakeHead;
    let scarySnakeTail;
    let score;

    while (true) {
      let snake = iterator.next();
      if (snake.done) {
        break;
      }

      if (snake.value.body.length + 1 < me.body.length) {
        targetSnakeHead = snake.value.body[0];
        break;
      } else {
        scarySnakeTail = snake.value.body[snake.value.body.length - 1];
      }
    }

    // only looks at first food right now. can change to closest food in the future (change food storage technique)
    let turnsUntilFood = board.lengthOfPath(board.grid.get(board.closestFood(me.body[0])), board.grid.get(board.food[0]), board.grid);
    let turnsUntilTail = board.lengthOfPath(
      board.grid.get(me.body[0]),
      board.grid.get(me.body[me.body.length - 1]),
      board.grid
    );
    let turnsUntilKill;
    let turnsUntilOtherTail;

    if (targetSnakeHead) {
      turnsUntilKill = board.lengthOfPath(board.grid.get(me.body[0]), board.grid.get(targetSnakeHead), board.grid);
    } else {
      turnsUntilKill = 0;
    }
    if (scarySnakeTail) {
      turnsUntilOtherTail = board.lengthOfPath(board.grid.get(me.body[0]), board.grid.get(scarySnakeTail), board.grid);
    } else {
      turnsUntilOtherTail = 0;
    }
    console.log(`turn until food ${turnsUntilFood}`)
    console.log(`turns until tail ${turnsUntilTail}`)
    // console.log(`turns until kill ${turnsUntilKill}`)
    // console.log(`turns until other tail ${turnsUntilOtherTail}`)
    score = (
      turnsUntilFood +
      turnsUntilTail +
      turnsUntilKill +
      turnsUntilOtherTail
    );
    // console.log(score)
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
      let score = this.evaluatePosition(board);

      return score;
    } else if (position == null || this.board.grid.get(position).isWall()) {
      // move was suicidal
      return -Infinity;
    }

    // make copy of board that gets moved forward.
    let newBoard = Object.assign(
      Object.create(Object.getPrototypeOf(board)),
      board,
    );
    newBoard.snakes.get(snakeId).body.unshift(position);
    newBoard.grid.get(newBoard.snakes.get(snakeId).body[1]).weight = 0;
    newBoard.grid.get(
      newBoard.snakes.get(snakeId).body[
        newBoard.snakes.get(snakeId).body.length - 1
      ],
    ).weight = 1;
    newBoard.snakes.get(snakeId).body.pop();

    if (maximizing) {
      // me trying to make the best choice
      let maxEval = -Infinity;
      for (let move of this.possibleMoves) {
        let moveEval = this.minMax(
          board,
          board.grid.get(board.snakes.get('me').body[0])[move],
          'me',
          depth - 1,
          alpha,
          beta,
          false,
        );
        maxEval = Math.max(maxEval, moveEval);
        alpha = Math.max(alpha, moveEval);
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
          let moveEval = this.minMax(
            board,
            board.grid.get(snake.body[0])[move],
            snakeId,
            depth - 1,
            alpha,
            beta,
            true,
          );
          minEval = Math.min(minEval, moveEval);
        }
      });
      return minEval;
    }
  }

  weighTheConsequences() {
    let bestMove;
    let maxEval = -Infinity;

    for (let move of this.possibleMoves) {
      let moveEval = this.minMax(
        this.board,
        this.head[move],
        'me',
        this.minMaxDepth,
        -Infinity,
        Infinity,
        false,
      );
      console.log(`${move}: ${moveEval}`);
      if (moveEval > maxEval) {
        maxEval = moveEval;
        bestMove = move;
      }
    }
    console.log(bestMove);
    return bestMove;
  }
}

module.exports = OddOphidian;
