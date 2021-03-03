const Board = require('./board');

class OddOphidian {
  constructor(apiRequest) {
    this.board = new Board(apiRequest);
    this.length = apiRequest.you.body.length;
    this.head = this.board.get(coordToChess(apiRequest.you.body[0]));
  }
}

module.exports = OddOphidian;

// module.exports = (apiRequest) => {
//   let board = makeBoard(apiRequest);
//   console.log(board);
//   return message;
// };
