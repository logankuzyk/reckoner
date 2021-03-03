class Snake {
  constructor(snake, board) {
    this.length = apiRequest.you.body.length;
    this.head = this.board.get(coordToChess(apiRequest.you.body[0]));
  }
}

module.exports = Snake;
