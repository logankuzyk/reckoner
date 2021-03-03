class Board {
  constructor(apiRequest) {
    this.board = this.makeBoard(apiRequest);
  }
  // Coordinate parameter is the same format as a single body element of a snake (for example).
  // Chess notation starts at 1, coordinate notation starts at 0.
  static coordToChess(coord) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';

    return `${alphabet.charAt(coord.x)}${String(coord.y + 1)}`;
  };

  isNextToFood(chess) {
    let tile = board.get(chess);
    for (let dir of [left, right, up, down]) {
      if (tile && tile[dir].food) {
        return true;
      }
    }
    return false;
  }

  displayBoard() {}

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
          left,
          right,
          up,
          down,
          solid: false,
          food: false,
        });
      }
    }

    apiRequest.board.food.forEach((food) => {
      let tile = board.get(coordToChess(food));
      tile.food = true;
    });
    apiRequest.board.snakes.forEach((snake) => {
      let i = 0;
      let lengthNextTurn = snake.body.length;

      if (isNextToFood(coordToChess(snake.body[0]))) {
        lengthNextTurn++;
      }

      if (lengthNextTurn < apiRequest.you.body.length) {
        // Snake is prey, head is not "solid"
        i++;
      }

      for (i; i < lengthNextTurn; i++) {
        let body = snake.body[i];
        let tile = board.get(coordToChess(body));
        tile.solid = true;
      }
    });

    return board;
  }
}

module.exports = Board;
