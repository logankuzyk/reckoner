const Snake = require('./snake');
const Tile = require('./tile');
const aStar = require('./aStar');

class Board {
  constructor(apiRequest) {
    this.grid = this.makeBoard(apiRequest);
    // [snake.id, Snake]
    this.snakes = new Map();
    this.food = [];
    this.dirtyTiles = [];
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

  closestFood(chess) {
    let minDistance = Infinity;
    let start = this.grid.get(chess);
    let foodChess = this.food[0];

    this.food.forEach((food, index) => {
      let foodTile = this.grid.get(food);
      let estimatedDistance = aStar.heuristic(start, foodTile);

      if (estimatedDistance < minDistance) {
        minDistance = estimatedDistance;
        foodChess = foodTile.chess;
      }
    });

    return foodChess;
  }

  isNextToFood(chess) {
    let tile = this.grid.get(chess);
    for (let dir of ['left', 'right', 'up', 'down']) {
      if (tile[dir] !== null && this.grid.get(tile[dir]).food) {
        return tile[dir].food;
      }
    }
    return null;
  }

  loadGamePieces(apiRequest) {
    apiRequest.board.food.forEach((food) => {
      let tile = this.grid.get(this.coordToChess(food));
      tile.food = true;
      this.food.push(this.coordToChess(food));
    });
    apiRequest.board.snakes.forEach((snake) => {
      let snakeObject = new Snake(snake);

      if (this.grid.get(snake.body[0]).food) {
        snake.body.push(snake.body[snake.body.length - 1]);
        this.deleteFood(this.coordToChess(snake.body[0]));
      }

      for (let i = 0; i < snake.body.length; i++) {
        let body = snake.body[i];
        let tile = this.grid.get(this.coordToChess(body));
        if (i === snake.body.length - 1) {
          tile.weight = 1;
        } else {
          tile.weight = 0;
        }
        snakeObject.body.push(this.coordToChess(body));
      }
      if (snake.body.length < apiRequest.you.body.length) {
        // Snake is prey, head is not "solid"
        snake.body[0].weight = 1;
      }
      if (
        snake.body[0].x == apiRequest.you.body[0].x &&
        snake.body[0].y == apiRequest.you.body[0].y
      ) {
        // console.log(snakeObject)
        this.snakes.set('me', snakeObject);
        this.grid.get(this.snakes.get('me').body[0]).weight = 1;
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

  lengthOfPath(tile1, tile2, board) {
    let path = aStar.search(tile1, tile2, board);
    // console.log(`Path from ${tile1.chess} to ${tile2.chess}`);
    // console.log(path);
    if (path.length === 0) {
      return Infinity;
    } else {
      return path.length;
    }
  }

  markDirty(chess) {
    this.dirtyTiles.push(chess);
  }

  cleanDirty() {
    this.dirtyTiles.forEach((chess) => {
      let tile = this.grid.get(chess);
      tile.h = 0;
      tile.g = 0;
      tile.g = 0;
      tile.closed = false;
      tile.visited = false;
      tile.parent = undefined;
    });
  }
}

module.exports = Board;
