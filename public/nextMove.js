importScripts('/js/score.js', '/js/search.js');

self.addEventListener('message', function(e) {
  // record start time
  var startTime = new Date();
  var g = search.convert(e.data.board);
  var n = search.psv(g, e.data.depth, -100000, 100000, e.data.board.turn ? 1 : -1, false, e.data.bestMoves);
  var elapsedTime = (new Date() - startTime)/1000;
  self.postMessage({next: n, time: Math.round(elapsedTime) + 's'});
}, false);