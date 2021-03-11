// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html

class BinaryHeap {
  constructor(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  push(element) {
    this.content.push(element);
    this.sinkDown(this.content.length - 1);
  }

  pop() {
    let result = this.content[0];
    let end = this.content.pop();

    if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }

    return result;
  }

  remove(node) {
    let i = this.content.indexOf(node);
    let end = this.content.pop();

    if (i !== this.content.length - 1) {
      this.content[i] = end;

      if (this.scoreFunction(end) < this.scoreFunction(node)) {
        this.sinkDown(i);
      } else {
        this.bubbleUp(i);
      }
    }
  }

  size() {
    return this.content.length;
  }

  rescoreElement(node) {
    this.sinkDown(this.content.indexOf(node));
  }

  sinkDown(n) {
    let element = this.content[n];

    while (n > 0) {
      let parentIndex = ((n + 1) >> 1) - 1;
      let parent = this.content[parentIndex];

      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentIndex] = element;
        this.content[n] = element;

        n = parentIndex;
      } else {
        break;
      }
    }
  }

  bubbleUp(n) {
    let length = this.content.length;
    let element = this.content[n];
    let elemScore = this.scoreFunction(element);

    while (true) {
      let child2N = (n + 1) << 1;
      let child1N = child2N - 1;

      let swap = null;
      let child1Score;

      if (child1N < length) {
        let child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);

        if (child1Score < elemScore) {
          swap = child1N;
        }
      }

      if (child2N < length) {
        let child2 = this.content[child2N];
        let child2Score = this.scoreFunction(child2);

        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }

      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      } else {
        break;
      }
    }
  }
}
