const Board = require('./board');
const Snake = require('./snake');

class OddOphidian extends Snake {
  constructor(apiRequest) {
    super(apiRequest.you)
    this.board = new Board(apiRequest);
    this.head = this.board.grid.get(this.body[0])
    this.move = this.weighTheConsequences();
  }

  weighTheConsequences() {
    return "right";
  }
}

module.exports = OddOphidian;
