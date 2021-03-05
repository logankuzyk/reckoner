const Snake = require('./snake');
const Tile = require('./tile');

class Board {
  constructor(apiRequest) {
    this.grid = this.makeBoard(apiRequest);
    // [snake.id, Snake]
    this.snakes = new Map();
    this.food = new Map();
    this.loadGamePieces(apiRequest);
  }
  // Coordinate parameter is the same format as a single body element of a snake (for example).
  // Chess notation starts at 1, coordinate notation starts at 0.
  coordToChess(coord) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';

    return `${alphabet.charAt(coord.x)}${String(coord.y + 1)}`;
  }

  deleteFood(chess) {
    let index = this.food.indexOf(chess);
    if (index > -1) {
      array.splice(index, 1);
    }
    this.grid.get(chess).food = false;
  }

  isNextToFood(chess) {
    let tile = this.grid.get(chess);
    for (let dir of ['left', 'right', 'up', 'down']) {
      if (tile[dir] !== null && this.grid.get(tile[dir]).food) {
        return tile.coord;
      }
    }
    return null;
  }

  displayBoard() {}

  loadGamePieces(apiRequest) {
    apiRequest.board.food.forEach((food) => {
      let tile = this.grid.get(this.coordToChess(food));
      tile.food = true;
      this.food.push(this.coordToChess(food));
    });
    apiRequest.board.snakes.forEach((snake) => {
      let snakeObject = new Snake(snake);
      let i = 0;

      if (this.isNextToFood(this.coordToChess(snake.body[0]))) {
        // 🚨🚨 ASSUMPTION: a snake will eat food if it's directly next to it
        snake.body.unshift(this.isNextToFood(this.coordToChess(snake.body[0])));
        deleteFood(this.coordToChess(snake.body[0]));
      }

      if (snake.body.length < apiRequest.you.body.length) {
        // Snake is prey, head is not "solid"
        i++;
      }
      for (i; i < snake.body.length; i++) {
        let body = snake.body[i];
        let tile = this.grid.get(this.coordToChess(body));
        tile.solid = true;
        snakeObject.body.unshift(this.coordToChess(body));
      }
      if (
        snake.body[0].x == apiRequest.you.body[0].x &&
        snake.body[0].y == apiRequest.you.body[0].y
      ) {
        this.snakes.set('me', snakeObject);
        this.snakes.get('me').body[0].solid = false;
      } else {
        this.snakes.set(snake.id, snakeObject);
      }
    });
  }

  makeBoard(apiRequest) {
    let board = new Map();

    for (let x = 1; x <= apiRequest.board.width; x++) {
      for (let y = 1; y <= apiRequest.board.height; y++) {
        let tile = new Tile(
          x,
          y,
          apiRequest.board.width,
          apiRequest.board.height,
        );
        board.set(tile.chess, tile);
      }
    }

    return board;
  }

  lengthOfPath(chess1, chess2) {
    let start = this.grid.get(chess1);
    let end = this.grid.get(chess2);
    let options = [];
    let minEval = Infinity;

    if (chess1 == chess2) {
      return 0;
    } else if (chess1 == null || chess2 == null || start.solid) {
      return Infinity;
    }

    if (end.x > start.x) {
      // need to go right
      options.push('right');
    } else if (end.x < start.x) {
      // need to go left
      options.push('left');
    }

    if (end.y > start.y) {
      // need to go up
      options.push('up');
    } else if (end.y < start.y) {
      // need to go down
      options.push('down');
    }

    for (let move of options) {
      let length = this.lengthOfPath(start[move], chess2);
      if (length < minEval) {
        minEval = length;
      }
    }

    return minEval + 1;
  }
}

module.exports = Board;
