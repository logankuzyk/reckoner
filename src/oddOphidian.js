const Board = require('./board');
const clone = require('lodash.clonedeep');

class OddOphidian {
  constructor(apiRequest) {
    this.minMaxDepth = 1;
    this.board = new Board(apiRequest);
    this.head = this.board.grid.get(this.board.getSnake('me').body[0]);
    this.possibleMoves = ['left', 'right', 'up', 'down'];
    this.move = this.weighTheConsequences();
  }

  evaluatePosition(board, snakeId) {
    console.log(snakeId);
    const snake = board.getSnake(snakeId);
    const head = snake.body[0];
    const tail = snake.body[snake.body.length - 1];

    // Higher is better for given snake.
    let score = 0;

    const hunters = board.closestHunters(snakeId);
    const preys = board.closestPreys(snakeId);

    const turnsUntilTail = board.lengthOfPath(head, tail);
    //not working
    const turnsUntilFood = board.lengthOfPath(
      head,
      board.closestFoods(snake.body[0])[0],
    );

    if (snake.health === 0 || snake.health <= turnsUntilFood) {
      return -Infinity;
    }
    // const turnsUntilKill = prey ? board.lengthOfPath(head, prey.body[0]) :

    // let turnsUntilOtherTail;

    // TODO: use food generation probability.
    // TODO: improve closest food technique.
    // console.log(board.grid.get(board.closestFoods(me.body[0])))
    // if (board.food.length > 0) {
    //   turnsUntilFood = board.lengthOfPath(
    //     board.grid.get(snake.body[0]),
    //     board.grid.get(board.closestFoods(snake.body[0])),
    //   );
    // }
    // if (board.grid.get(snake.body[0]).food) {
    //   score += 4;
    // } else if (isFinite(turnsUntilFood)) {
    //   score += 4 / (turnsUntilFood + 1);
    // }

    // const targetTile =
    //   board.grid.get(snake.body[snake.body.length - 1]).weight === 0
    //     ? board.bestEmptyTile(snake.body[0], snake.body[snake.body.length - 1])
    //     : board.grid.get(snake.body[snake.body.length - 1]);

    // turnsUntilTail = board.lengthOfPath(
    //   board.grid.get(snake.body[0]),
    //   targetTile,
    // );

    // if (isFinite(turnsUntilTail)) {
    //   score += 8;
    // }

    // if (targetSnakeHead) {
    //   turnsUntilKill = board.lengthOfPath(
    //     board.grid.get(snake.body[0]),
    //     board.grid.get(targetSnakeHead),
    //   );
    // } else {
    //   turnsUntilKill = Infinity;
    // }

    // if (snake.body[0] == targetSnakeHead) {
    //   score += 16;
    // } else if (isFinite(turnsUntilKill)) {
    //   score += 16 / (turnsUntilKill + 1);
    // }

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

  max(board, position, depth) {
    if (depth === 0) {
      //snake to return value for is the last one to have moved
      //need to go from smallest to biggest because that's the reverse of how it was called
      const movedSnakes = board.snakes.filter((snake) => snake.moved);
      const lastSnake = movedSnakes[movedSnakes.length - 1];
      return this.evaluatePosition(board, lastSnake.id);
    }
    // pretty sure this is impossible
    // if (!snakeId) {
    //   // all snakes have moved this turn
    //   return this.max(board, position, depth - 1);
    // }
    const snake = board.snakes.filter((snake) => !snake.moved)[0];

    if (
      position === null ||
      board.grid.get(position).isWall() ||
      board.getSnake(snake.id).health === 0
    ) {
      // might need to change this to move onto then next snake
      return -Infinity;
    }

    const newBoard = clone(board);
    const newSnake = newBoard.getSnake(snake.id);

    // Move new board forward.
    newSnake.body.unshift(position);
    newSnake.body.pop();
    newSnake.health -= 1;
    newSnake.moved = true;

    if (newBoard.grid.get(position).food) {
      newBoard.grid.get(newSnake.body[newSnake.body.length - 1]).weight = 0;
      newSnake.body.push(newSnake.body[newSnake.body.length - 1]);
      newSnake.health = 100;
      newBoard.deleteFood(newSnake.body[0]);
    } else {
      newBoard.grid.get(newSnake.body[newSnake.body.length - 1]).weight = 1;
    }

    let maxEval = -Infinity;

    newBoard.snakes
      .filter((snake) => !snake.moved)
      .forEach((snake) => {
        for (let move of this.possibleMoves) {
          let moveEval = this.max(
            newBoard,
            newBoard.grid.get(snake.body[0])[move],
            depth,
          );
          maxEval = Math.max(maxEval, moveEval);
        }
      });
    return maxEval;
  }

  weighTheConsequences() {
    let bestMove;
    let maxEval = -Infinity;

    for (let move of this.possibleMoves) {
      const moveEval = this.max(this.board, this.head[move], this.minMaxDepth);
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
