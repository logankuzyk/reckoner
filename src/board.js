class Board {
  constructor(apiRequest) {
    this.board = this.makeBoard(apiRequest);
    this.loadGamePieces(apiRequest);
  }
  // Coordinate parameter is the same format as a single body element of a snake (for example).
  // Chess notation starts at 1, coordinate notation starts at 0.
  coordToChess(coord) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';

    return `${alphabet.charAt(coord.x)}${String(coord.y + 1)}`;
  }

  isNextToFood(chess) {
    let tile = this.board.get(chess);
    for (let dir of ['left', 'right', 'up', 'down']) {
      if (tile[dir] !== null && this.board.get(tile[dir]).food) {
        return tile.coord;
      }
    }
    return null;
  }

  displayBoard() {}

  loadGamePieces(apiRequest) {
    apiRequest.board.food.forEach((food) => {
      let tile = this.board.get(this.coordToChess(food));
      tile.food = true;
    });
    apiRequest.board.snakes.forEach((snake) => {
      let i = 0;

      if (this.isNextToFood(this.coordToChess(snake.body[0]))) {
        snake.body.unshift(this.isNextToFood(this.coordToChess(snake.body[0])));
      }

      if (snake.body.length < apiRequest.you.body.length) {
        // Snake is prey, head is not "solid"
        i++;
      }
      for (i; i < snake.body.length; i++) {
        let body = snake.body[i];
        let tile = this.board.get(this.coordToChess(body));
        tile.solid = true;
      }
    });
  }

  makeBoard(apiRequest) {
    let board = new Map();
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';

    for (let x = 1; x <= apiRequest.board.width; x++) {
      for (let y = 1; y <= apiRequest.board.height; y++) {
        // Setting direction IDs for each tile object.
        let left, right, up, down;
        if (x == 1) {
          left = null;
        } else {
          left = `${alphabet.charAt(x - 2)}${String(y)}`;
        }

        if (x == apiRequest.board.width) {
          right = null;
        } else {
          right = `${alphabet.charAt(x)}${String(y)}`;
        }

        if (y == 1) {
          down = null;
        } else {
          down = `${alphabet.charAt(x - 1)}${String(y - 1)}`;
        }

        if (y == apiRequest.board.height) {
          up = null;
        } else {
          up = `${alphabet.charAt(x - 1)}${String(y + 1)}`;
        }

        board.set(`${alphabet.charAt(x - 1)}${String(y)}`, {
          coord: { x: x - 1, y: y - 1 },
          left,
          right,
          up,
          down,
          solid: false,
          food: false,
        });
      }
    }

    return board;
  }
}

module.exports = Board;
