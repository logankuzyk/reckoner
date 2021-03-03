class Snake {
  constructor(snake) {
    this.length = snake.body.length;
    this.health = snake.health;
    // Array of chess notation strings
    this.body = [];
  }
}

module.exports = Snake;
