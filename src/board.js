const Snake = require('./snake');
const Tile = require('./tile');
const aStar = require("./aStar")

class Board {
  constructor(apiRequest) {
    this.grid = this.makeBoard(apiRequest);
    // [snake.id, Snake]
    this.snakes = new Map();
    this.food = [];
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
    })

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
      let i = 0;

      if (this.isNextToFood(this.coordToChess(snake.body[0]))) {
        // 🚨🚨 ASSUMPTION: a snake will eat food if it's directly next to it
        // TODO: make it so bigger snake takes it if two are next to eachother.
        // TODO: make it so snake grows on the turn after eating.
        snake.body.unshift(this.isNextToFood(this.coordToChess(snake.body[0])));
        this.deleteFood(this.coordToChess(snake.body[0]));
      }

      if (snake.body.length < apiRequest.you.body.length) {
        // Snake is prey, head is not "solid"
        i++;
      }
      for (i; i < snake.body.length; i++) {
        let body = snake.body[i];
        let tile = this.grid.get(this.coordToChess(body));
        tile.weight = 0;
        snakeObject.body.push(this.coordToChess(body));
      }
      if (
        snake.body[0].x == apiRequest.you.body[0].x &&
        snake.body[0].y == apiRequest.you.body[0].y
      ) {
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

  lengthOfPath(tile1, tile2, grid) {
    let path = aStar.search(tile1, tile2, grid);
    // console.log(path)
    return path.length;
  }
}

module.exports = Board;
