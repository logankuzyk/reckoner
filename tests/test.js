const Board = require("../src/board")
const fs = require("fs")

let request = fs.readFileSync(__dirname + "/request.json")
request = JSON.parse(request)
// let board = new Board(request)

const OddOphidian = require("../src/oddOphidian")
// console.log(board.lengthOfPath("a10", "b10"))
let snake = new OddOphidian(request)
console.log(snake)