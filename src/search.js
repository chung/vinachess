var score = require('./score.js');

var sb = [
6, 0, 0, 1, 0, 0,-1, 0, 0, -6,
4, 0, 5, 0, 0, 0, 0,-5, 0, -4,
3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
2, 0, 0, 0, 0, 0, 0, 0, 0, -2,
7, 0, 0, 1, 0, 0,-1, 0, 0, -7,
2, 0, 0, 0, 0, 0, 0, 0, 0, -2,
3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
4, 0, 5, 0, 0, 0, 0,-5, 0, -4,
6, 0, 0, 1, 0, 0,-1, 0, 0, -6];

var eval = function(g) {
  var v = 0, i = 89;
  do {
    if (g[i] > 0) {
      v += score.pvalue[g[i]][i] + score.mvalue[g[i]];
    } else if (g[i] < 0) {
      v -= score.pvalue[-g[i]][89-i] + score.mvalue[-g[i]];
    }
  } while(i--)
  return v;
}

var genMoves = function(g, idx) {
  return [];
}

//console.log(eval(sb));