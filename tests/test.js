const Board = require("../src/board")
const fs = require("fs")

let request = fs.readFileSync(__dirname + "/request.txt")
request = JSON.parse(request)
let board = new Board(request)