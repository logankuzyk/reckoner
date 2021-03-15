const Board = require('./board');
const clone = require('lodash.clonedeep');

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
  
    // Output score. Higher is better.
    let score = 0;
    let iterator = board.snakes.values();
    let targetSnakeHead;
    let scarySnakeTail;

    let turnsUntilTail;
    let turnsUntilFood;
    let turnsUntilKill;
    let turnsUntilOtherFood;

    while (true) {
      let snake = iterator.next();
      if (snake.done) {
        break;
      }

      // TODO: make it pay attention to the closest snakes (and if they're bigger or smaller)
      if (snake.value.body.length + 1 < me.body.length) {
        targetSnakeHead = snake.value.body[0];
      } else {
        scarySnakeTail = snake.value.body[snake.value.body.length - 1];
      }
    }

    // TODO: use food generation probability.
    // TODO: improve closest food technique.
    turnsUntilFood = board.lengthOfPath(
      board.grid.get(me.body[0]),
      board.grid.get(board.closestFood(me.body[0])),
      board,
    );

    let tailTile = board.grid.get(me.body[me.body.length - 1]);
    let targetTile;
    if (board.grid.get(me.body[me.body.length - 1]).weight === 0) {
      console.log("SOLID TAIL")
      for (let dir of this.possibleMoves) {
        if (board.grid.get(me.body[me.body.length - 3])[dir] == tailTile.chess) {
          targetTile = board.grid.get(tailTile[dir])
        }
      }
    } else {
      targetTile = board.grid.get(me.body[me.body.length - 1])
    }

    turnsUntilTail = board.lengthOfPath(
      board.grid.get(me.body[0]),
      targetTile,
      board,
    );

    // if (targetSnakeHead) {
    //   turnsUntilKill = board.lengthOfPath(
    //     board.grid.get(me.body[0]),
    //     board.grid.get(targetSnakeHead),
    //     board,
    //   );
    // } else {
    //   turnsUntilKill = 0;
    // }

    // if (scarySnakeTail) {
    //   turnsUntilOtherTail = board.lengthOfPath(
    //     board.grid.get(me.body[0]),
    //     board.grid.get(scarySnakeTail),
    //     board,
    //   );
    // } else {
    //   turnsUntilOtherTail = 0;
    // }
    
    if (isFinite(turnsUntilTail)) {
      score += 8
    }

    if (board.grid.get(me.body[0]).food) {
      score += 4;
    } else if (isFinite(turnsUntilFood)) {
      score += (4 * (1 / (turnsUntilFood + 1)))
    }

    // if (isFinite(turnsUntilTail)) {
    //   if (isFinite(turnsUntilFood)) {
    //     // console.log("returning turns until food")
    //     return -turnsUntilFood;
    //   } else {
    //     // console.log("returning turns until tail")
    //     return -turnsUntilTail;
    //   }
    // } else {
    //   return -Infinity;
    // }
    console.log(`turn until food ${turnsUntilFood}`);
    console.log(`turns until tail ${turnsUntilTail}`);
    // console.log(`turns until kill ${turnsUntilKill}`)
    // console.log(`turns until other tail ${turnsUntilOtherTail}`)

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
    } else if (position == null || board.grid.get(position).isWall()) {
      // move was suicidal
      return -Infinity;
    }

    let newBoard = clone(board);
    // console.log(board.snakes.get("me").body)
    // Move new board forward.
    let snake = newBoard.snakes.get(snakeId);

    if (newBoard.grid.get(snake.body[0]).food) {
      newBoard.deleteFood(snake.body[0])
    }

    snake.body.unshift(position);
    snake.body.pop();

    if (newBoard.grid.get(position).food) {
      newBoard.grid.get(snake.body[snake.body.length - 1]).weight = 0;
      snake.body.push(snake.body[snake.body.length - 1]);
    } else {
      newBoard.grid.get(snake.body[1]).weight = 0;
      newBoard.grid.get(snake.body[snake.body.length - 1]).weight = 1;
    }

    if (maximizing) {
      // me trying to make the best choice
      let maxEval = -Infinity;
      for (let move of this.possibleMoves) {
        let moveEval = this.minMax(
          newBoard,
          newBoard.grid.get(newBoard.snakes.get('me').body[0])[move],
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
      newBoard.snakes.forEach((snake, snakeId) => {
        for (let move of this.possibleMoves) {
          let moveEval = this.minMax(
            newBoard,
            newBoard.grid.get(snake.body[0])[move],
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
        true,
      );
      console.log(`${move}: ${moveEval}`);
      if (moveEval > maxEval) {
        maxEval = moveEval;
        bestMove = move;
      }
    }

    console.log(`Going ${bestMove}`);
    return bestMove;
  }
}

module.exports = OddOphidian;
