// A* algorithm adapted from:
// http://github.com/bgrins/javascript-astar
// Implements the A* search algorithm using a binary heap.
// http://eloquentjavascript.net/appendix2.html

BinaryHeap = require('./binaryHeap');

getNewHeap = (node) => {
  return new BinaryHeap((node) => {
    return node.f;
  });
};

pathTo = (node) => {
  let curr = node;
  let path = [];

  while (curr.parent) {
    path.unshift(curr);
    curr = curr.parent;
  }

  return path;
};

aStar = {
  search: (start, end, options = {}) => {
    //graph.cleanDirty();
    let heuristic = options.heuristic || aStar.heuristics.manhattan;
    let closest = options.closest || false;

    let openHeap = getNewHeap();
    let closestNode = start;

    start.h = heuristic(start, end);

    openHeap.push(start);

    while (openHeap.size() > 0) {
      let currentNode = openHeap.pop();

      if (currentNode == end) {
        return pathTo(currentNode);
      }

      currentNode.closed = true;

      let neighbors = graph.neighbors(currentNode);

      for (let i = 0, iL = neighbors.length; i < iL; i++) {
        let neighbor = neighbors[i];

        if (neighbor.closed || neighbor.isWall()) {
          continue;
        }

        let gScore = currentNode.g + neighbor.getCost(currentNode);
        let beenVisited = neighbor.visited;

        if (!beenVisited || gScore < neighbor.g) {
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = neighbor.h || heuristic(neighbor, end);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          //graph.markDirty(neighbor);

          if (closest) {
            if (
              neighbor.h < closestNode.h ||
              (neighbor.h === closestNode.h && neighbor.g < closestNode.g)
            ) {
              closestNode = neighbor;
            }
          }

          if (!beenVisited) {
            openHeap.push(neighbor);
          } else {
            openHeap.rescoreElement(neighbor);
          }
        }
      }
    }

    if (closest) {
      return pathTo(closestNode);
    }

    return [];
  },
  heuristics: (coord1, coord2) => {
    let deltax = Math.abs(coord2.x - coord1.x);
    let deltay = Math.abs(coord2.y - coord1.y);

    return deltax + deltay;
  },
  cleanNode: (node) => {
    node.f = 0;
    node.g = 0;
    node.h = 0;
    node.visited = false;
    node.closed = false;
    node.parent = null;
  },
};

module.exports = aStar;
