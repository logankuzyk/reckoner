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
  // Returns the best move when navigating from chess1 to chess2.
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

  killSnake(snakeId) {
    const snake = this.getSnake(snakeId);

    snake.body.forEach((body) => {
      this.grid.get(body).weight = 1;
    });

    this.snakes = this.snakes.filter((snake) => snake.id !== snakeId);
  }

  loadGamePieces(apiRequest) {
    apiRequest.board.food.forEach((food) => {
      let tile = this.grid.get(this.coordToChess(food));
      tile.food = true;
      this.food.push(this.coordToChess(food));
    });
    apiRequest.board.snakes.forEach((snake, index) => {
      let snakeObject = new Snake({ moved: false, ...snake });

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
        snakeObject.id = 'me';
        this.snakes[index] = snakeObject;
      } else {
        this.snakes[index] = snakeObject;
      }
    });

    // Sort snakes in descending order. If two snakes are the same size, the one that is closest to me goes before the other.
    this.snakes.sort((a, b) => {
      if (a.body.length === b.body.length) {
        const me = this.grid.get(this.getSnake('me').body[0]);
        const aHead = this.grid.get(a.body[0]);
        const bHead = this.grid.get(b.body[0]);

        if (this.lengthOfPath(me, aHead) < this.lengthOfPath(me, bHead)) {
          return 1;
        } else {
          return -1;
        }
      } else if (a.body.length < b.body.length) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  snakePossibleMoves(snakeId) {
    const snake = this.getSnake(snakeId);
    const head = this.grid.get(snake.body[0]);

    return ['left', 'right', 'up', 'down'].filter(
      (move) => head[move] && !this.grid.get(head[move]).isWall(),
    );
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

  lengthOfPath(tile1, tile2) {
    if (typeof tile1 === 'string' || typeof tile2 === 'string') {
      tile1 = this.grid.get(tile1);
      tile2 = this.grid.get(tile2);
    }

    if (tile1.chess === tile2.chess) {
      return 0;
    }

    const tile1Weight = tile1.weight;
    const tile2Weight = tile2.weight;

    tile1.weight = 1;
    tile2.weight = 1;

    const path = aStar.search(tile1, tile2, this);

    tile1.weight = tile1Weight;
    tile2.weight = tile2Weight;
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

  closestFoods(chess) {
    if (this.food.length === 0) {
      return null;
    }

    const head = this.grid.get(chess);

    const foods = this.food.sort((a, b) => {
      if (
        aStar.heuristic(head, this.grid.get(a)) <
        aStar.heuristic(head, this.grid.get(b))
      ) {
        return -1;
      } else {
        return 1;
      }
    });

    return foods;
  }

  closestHunters(snakeId) {
    if (this.snakes.length === 1) {
      return null;
    }

    const prey = this.getSnake(snakeId);
    const preyHead = this.grid.get(prey.body[0]);

    const hunters = this.snakes
      .filter(
        (snake) =>
          snake.id !== prey.id && snake.body.length <= prey.body.length,
      )
      .sort((a, b) => {
        if (
          aStar.heuristic(preyHead, this.grid.get(a.body[0])) <
          aStar.heuristic(preyHead, this.grid.get(b.body[0]))
        ) {
          return -1;
        } else {
          return 1;
        }
      });

    return hunters;
  }

  closestPreys(snakeId) {
    if (this.snakes.length === 1) {
      return null;
    }

    const hunter = this.getSnake(snakeId);
    const hunterHead = this.grid.get(hunter.body[0]);

    const preys = this.snakes
      .filter(
        (snake) =>
          snake.id !== hunter.id && snake.body.length > hunter.body.length,
      )
      .sort((a, b) => {
        if (
          aStar.heuristic(hunterHead, this.grid.get(a.body[0])) <
          aStar.heuristic(hunterHead, this.grid.get(b.body[0]))
        ) {
          return -1;
        } else {
          return 1;
        }
      });

    return preys;
  }
}

module.exports = Board;
