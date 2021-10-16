const Board = require('./board');
const clone = require('lodash.clonedeep');

class OddOphidian {
  constructor(apiRequest) {
    this.minMaxDepth = 5;
    this.board = new Board(apiRequest);
    this.head = this.board.grid.get(this.board.snakes.get('me').body[0]);
    this.possibleMoves = ['left', 'right', 'up', 'down'];
    this.move = this.weighTheConsequences();
  }

  evaluatePosition(board) {
    let me = board.snakes.get('me');

    // Output score. Higher is better for me, lower is better for opponents.
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
    // console.log(board.grid.get(board.closestFood(me.body[0])))
    if (board.food.length > 0) {
      turnsUntilFood = board.lengthOfPath(
        board.grid.get(me.body[0]),
        board.grid.get(board.closestFood(me.body[0])),
        board,
      );
    }
    if (board.grid.get(me.body[0]).food) {
      score += 4;
    } else if (isFinite(turnsUntilFood)) {
      score += 4 * (1 / (turnsUntilFood + 1));
    }

    const targetTile =
      board.grid.get(me.body[me.body.length - 1]).weight === 0
        ? board.bestEmptyTile(me.body[0], me.body[me.body.length - 1])
        : board.grid.get(me.body[me.body.length - 1]);

    turnsUntilTail = board.lengthOfPath(
      board.grid.get(me.body[0]),
      targetTile,
      board,
    );

    if (isFinite(turnsUntilTail)) {
      score += 8;
    }

    // if (targetSnakeHead) {
    //   turnsUntilKill = board.lengthOfPath(
    //     board.grid.get(me.body[0]),
    //     board.grid.get(targetSnakeHead),
    //     board,
    //   );
    // } else {
    //   turnsUntilKill = Infinity;
    // }

    // if (me.body[0] == targetSnakeHead) {
    //   score += 4;
    // } else if (isFinite(turnsUntilKill)) {
    //   score += 4 * (1 / (turnsUntilKill + 1));
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
    // console.log(`turn until food ${turnsUntilFood}`);
    // console.log(`turns until tail ${turnsUntilTail}`);
    // console.log(`turns until kill ${turnsUntilKill}`)
    // console.log(`turns until other tail ${turnsUntilOtherTail}`)

    return score;
  }

  // board: game board representing a possible move sequence (instanceof Board)
  // position: new head position of given snake
  // snakeId: ID of snake that moved in the last turn.
  // depth: maximum depth of move tree.
  // alpha/beta: for pruning.
  minMax(board, position, snakeId, depth, alpha, beta) {
    if (depth === 0) {
      // return static evaluation
      let score = this.evaluatePosition(board);

      return score;
    }

    if (
      position == null ||
      board.grid.get(position).isWall() ||
      board.snakes.get(snakeId).health === 0
    ) {
      // move was suicidal
      // might want to return 0 instead.
      // this function gets run for all snakes and the static evaluation function is just for me?
      // if health == 0
      if (snakeId === 'me') {
        return -Infinity;
      } else {
        return Infinity;
      }
    }
    const newBoard = clone(board);
    const snake = newBoard.snakes.get(snakeId);

    // Move new board forward.
    snake.body.unshift(position);
    snake.body.pop();
    newBoard.grid.get(snake.body[1]).weight = 0;
    snake.health -= 1;

    if (newBoard.grid.get(position).food) {
      // snake ate food
      // tail will be solid
      newBoard.grid.get(snake.body[snake.body.length - 1]).weight = 0;
      snake.body.push(snake.body[snake.body.length - 1]);
      snake.health = 100;
      newBoard.deleteFood(snake.body[0]);
    } else {
      newBoard.grid.get(snake.body[snake.body.length - 1]).weight = 1;
    }

    const maximizing = snakeId == 'me' ? true : false;

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
        );
        maxEval = Math.max(maxEval, moveEval);
        alpha = Math.max(alpha, moveEval);
        if (beta <= alpha) {
          break;
        }
      }
      return maxEval;
    } else {
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
          );
          minEval = Math.min(minEval, moveEval);
          beta = Math.min(beta, moveEval);
          if (beta <= alpha) {
            break;
          }
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
