const Board = require('./board');
const clone = require('lodash.clonedeep');

class Reckoner {
  constructor(apiRequest) {
    this.minMaxDepth = 1;
    this.board = new Board(apiRequest);
    this.head = this.board.grid.get(this.board.getSnake('me').body[0]);
    this.possibleMoves = ['left', 'right', 'up', 'down'];
    this.move = this.weighTheConsequences();
  }

  evaluatePosition(board, snakeId) {
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

  max(board, depth, biggerSnakeId, move) {
    const snake = board.getSnake(biggerSnakeId);
    const position = board.grid.get(snake.body[0])[move];

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

    let snakesToMove = newBoard.snakes.filter((snake) => !snake.moved);

    if (newBoard.getSnake(snake.id).health === 0) {
      //kill snake
      return {
        [biggerSnakeId]: [move, -Infinity],
        ...this.moveRemainingSnakes(snakesToMove, newBoard, depth),
      };
    }

    if (depth < 1) {
      return {
        [biggerSnakeId]: [move, this.evaluatePosition(newBoard, biggerSnakeId)],
        ...this.moveRemainingSnakes(snakesToMove, newBoard, depth),
      };
    } else {
      if (snakesToMove.length === 0) {
        depth -= 1;
        newBoard.snakes.forEach((snake) => (snake.moved = false));
        snakesToMove = newBoard.snakes;
      }
      return {
        ...this.moveRemainingSnakes(snakesToMove, newBoard, depth),
      };
    }
  }

  moveRemainingSnakes(snakesToMove, board, depth) {
    let snakeEvals = {};
    const snake = snakesToMove[0];

    if (!snake) {
      return snakeEvals;
    }
    // console.log('hello');

    for (let move of board.snakePossibleMoves(snake.id)) {
      let moveEval = this.max(board, depth, snake.id, move);
      if (!snakeEvals[snake.id]) {
        snakeEvals[snake.id] = [move, -Infinity];
      }
      if (
        moveEval[snake.id] &&
        snakeEvals[snake.id][1] < moveEval[snake.id][1]
      ) {
        snakeEvals = moveEval;
      }
    }

    return snakeEvals;
  }

  weighTheConsequences() {
    const simulationBoard = clone(this.board);

    // Best snake chooses its best "board" then I choose my best move from there.
    const move = this.moveRemainingSnakes(
      this.board.snakes,
      simulationBoard,
      this.minMaxDepth,
    ).me[0];

    console.log(`Going ${move}`);
    return move;
  }
}

module.exports = Reckoner;
