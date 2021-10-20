const Board = require('../src/board');
const fs = require('fs');

let request = fs.readFileSync(__dirname + '/request.json');
request = JSON.parse(request);
// let board = new Board(request)

const Reckoner = require('../src/reckoner');
// console.log(board.lengthOfPath("a10", "b10"))
let snake = new Reckoner(request);
console.log(`CHOSEN MOVE: ${snake.move}`);
