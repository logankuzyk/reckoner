class Tile {
  // x and y start at 1 not 0.
  constructor(x, y, width, height) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';

    this.chess = `${alphabet.charAt(x - 1)}${String(y)}`;
    this.x = x - 1
    this.y = y - 1 ;
    this.weight;
    this.food;
    this.right;
    this.left;
    this.up;
    this.down;

    if (x == 1) {
      this.left = null;
    } else {
      this.left = `${alphabet.charAt(x - 2)}${String(y)}`;
    }

    if (x == width) {
      this.right = null;
    } else {
      this.right = `${alphabet.charAt(x)}${String(y)}`;
    }

    if (y == 1) {
      this.down = null;
    } else {
      this.down = `${alphabet.charAt(x - 1)}${String(y - 1)}`;
    }

    if (y == height) {
      this.up = null;
    } else {
      this.up = `${alphabet.charAt(x - 1)}${String(y + 1)}`;
    }
  }

  isWall() {
    return this.weight === 0;
  }

  getCost() {
    // if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
    //   return this.weight * 1.41421;
    // }
    return this.weight;
  }
}

module.exports = Tile;
