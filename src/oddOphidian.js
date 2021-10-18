const Board = require('./board');
const clone = require('lodash.clonedeep');

class OddOphidian {
  constructor(apiRequest) {
    this.minMaxDepth = 4;
    this.board = new Board(apiRequest);
    this.head = this.board.grid.get(this.board.getSnake('me').body[0]);
    this.possibleMoves = ['left', 'right', 'up', 'down'];
    this.move = this.weighTheConsequences();
  }

  evaluatePosition(board, snakeId) {
    let snake = board.getSnake(snakeId);

    // Output score. Higher is better for me, lower is better for opponents.
    let score = 0;
    let targetSnakeHead = board.closestPrey(snakeId)
      ? board.closestPrey(snakeId).body[0]
      : null;
    let scarySnakeTail = board.closestHunter(snakeId)
      ? board.closestHunter(snakeId).body[
          board.closestHunter(snakeId).body.length - 1
        ]
      : null;

    let turnsUntilTail;
    let turnsUntilFood;
    let turnsUntilKill;
    let turnsUntilOtherTail;

    // TODO: use food generation probability.
    // TODO: improve closest food technique.
    // console.log(board.grid.get(board.closestFood(me.body[0])))
    if (board.food.length > 0) {
      turnsUntilFood = board.lengthOfPath(
        board.grid.get(snake.body[0]),
        board.grid.get(board.closestFood(snake.body[0])),
      );
    }
    if (board.grid.get(snake.body[0]).food) {
      score += 4;
    } else if (isFinite(turnsUntilFood)) {
      score += 4 / (turnsUntilFood + 1);
    }

    const targetTile =
      board.grid.get(snake.body[snake.body.length - 1]).weight === 0
        ? board.bestEmptyTile(snake.body[0], snake.body[snake.body.length - 1])
        : board.grid.get(snake.body[snake.body.length - 1]);

    turnsUntilTail = board.lengthOfPath(
      board.grid.get(snake.body[0]),
      targetTile,
    );

    if (isFinite(turnsUntilTail)) {
      score += 8;
    }

    if (targetSnakeHead) {
      turnsUntilKill = board.lengthOfPath(
        board.grid.get(snake.body[0]),
        board.grid.get(targetSnakeHead),
      );
    } else {
      turnsUntilKill = Infinity;
    }

    if (snake.body[0] == targetSnakeHead) {
      score += 16;
    } else if (isFinite(turnsUntilKill)) {
      score += 16 / (turnsUntilKill + 1);
    }

    // if (scarySnakeTail) {
    //   turnsUntilOtherTail = board.lengthOfPath(
    //     board.grid.get(me.body[0]),
    //     board.grid.get(scarySnakeTail),
    //     board,
    //   );
    // } else {
    //   turnsUntilOtherTail = Infinity;
    // }

    // if (isFinite(turnsUntilOtherTail)) {
    //   score += 4 / (turnsUntilOtherTail + 1);
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
      let score = this.evaluatePosition(board, snakeId);

      return score;
    }

    if (
      position == null ||
      board.grid.get(position).isWall() ||
      board.getSnake(snakeId).health === 0
    ) {
      // Death
      return -Infinity;
    }

    const newBoard = clone(board);
    const snake = newBoard.getSnake(snakeId);

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
      let maxEval = -Infinity;
      for (let move of this.possibleMoves) {
        let moveEval = this.minMax(
          newBoard,
          newBoard.grid.get(newBoard.getSnake('me').body[0])[move],
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
          let moveEval =
            0 -
            this.minMax(
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
