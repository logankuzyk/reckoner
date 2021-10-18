const Snake = require('./snake');
const Tile = require('./tile');
const aStar = require('./aStar');

class Board {
  constructor(apiRequest) {
    this.grid = this.makeBoard(apiRequest);
    // [snake.id, Snake]
    this.snakes = [];
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

  // For navigating to tail when it's solid (after eating).
  bestEmptyTile(chess1, chess2) {
    let start = this.grid.get(chess1);
    let end = this.grid.get(chess2);
    let output = this.grid.get(chess2);

    let dx0 = end.x - start.x;
    let dy0 = end.y - start.y;
    let moves = Math.abs(dx0) + Math.abs(dy0);

    for (let dir of ['left', 'right', 'up', 'down']) {
      let targetTile = this.grid.get(end[dir]);

      if (!targetTile || targetTile.isWall()) {
        continue;
      }

      let dx1 = targetTile.x - start.x;
      let dy1 = targetTile.y - start.y;
      let newMoves = Math.abs(dx1) + Math.abs(dy1);

      if (newMoves < moves || output.isWall()) {
        moves = newMoves;
        output = targetTile;
      }
    }

    return output;
  }

  deleteFood(chess) {
    let index = this.food.indexOf(chess);
    if (index > -1) {
      this.food.splice(index, 1);
    }
    this.grid.get(chess).food = false;
  }

  closestFood(chess) {
    let minDistance = Infinity;
    let start = this.grid.get(chess);
    let foodChess = this.food[0];

    this.food.forEach((food) => {
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

  getSnake(snakeId) {
    return this.snakes.filter((snake) => snake.id === snakeId)[0];
  }

  loadGamePieces(apiRequest) {
    apiRequest.board.food.forEach((food) => {
      let tile = this.grid.get(this.coordToChess(food));
      tile.food = true;
      this.food.push(this.coordToChess(food));
    });
    apiRequest.board.snakes.forEach((snake, index) => {
      let snakeObject = new Snake(snake);

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

      // Food isn't dealt with here. It's in the minMax function because the snake gets moved after creating the new board for a simulation.

      // if (snake.body.length < apiRequest.you.body.length) {
      //   // Snake is prey, head is not "solid"
      //   snake.body[0].weight = 1;
      // }

      if (
        snakeObject.body[snake.body.length - 1] ==
        snakeObject.body[snake.body.length - 2]
      ) {
        this.grid.get(snakeObject.body[snake.body.length - 1]).weight = 0;
      }

      if (
        snake.body[0].x == apiRequest.you.body[0].x &&
        snake.body[0].y == apiRequest.you.body[0].y
      ) {
        // console.log(snakeObject)
        snakeObject.id = 'me';
        this.snakes[index] = snakeObject;
        this.grid.get(this.snakes[index].body[0]).weight = 1;
      } else {
        this.snakes[index] = snakeObject;
      }
    });

    // Put 'me' at the end of the list so it's easier to make all other snakes go first.
    this.snakes.sort((a) => (a.id === 'me' ? 0 : -1));
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

  closestHunter(snakeId) {
    if (this.snakes.length === 0) {
      return null;
    }

    let prey = this.getSnake(snakeId);
    let preyHead = this.grid.get(prey.body[0]);
    let minDistance = Infinity;
    let output = null;

    this.snakes.forEach((snake) => {
      let hunterHead = this.grid.get(snake.body[0]);
      let estimatedDistance = aStar.heuristic(hunterHead, preyHead);

      if (
        snake.body.length <= prey.body.length &&
        estimatedDistance < minDistance &&
        snake.id !== snakeId
      ) {
        output = snake.id;
      }
    });

    return this.getSnake(output);
  }

  closestPrey(snakeId) {
    if (this.snakes.size === 0) {
      return null;
    }
    let hunter = this.getSnake(snakeId);
    let hunterHead = this.grid.get(hunter.body[0]);
    let minDistance = Infinity;
    let output = null;

    this.snakes.forEach((snake) => {
      let preyHead = this.grid.get(snake.body[0]);
      let estimatedDistance = aStar.heuristic(preyHead, hunterHead);

      if (
        snake.body.length < hunter.body.length &&
        estimatedDistance < minDistance &&
        snake.id !== snakeId
      ) {
        output = snake.id;
      }
    });

    return this.getSnake(output);
  }
}

module.exports = Board;
