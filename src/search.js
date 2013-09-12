var search = {};
var score = score || require('./score.js');

search.evaluate = function(g) {
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

search.alphabeta =  function(g, d, alpha, beta, c) {
  //console.log('calling with d = ' + d + ', alpha = ' + alpha + ', beta = ' + beta + ', turn is ' + c);
  if (d === 0) return {value: search.evaluate(g), move: []};
  var ms = search.genAllMoves(g, c), m, ab, i;
  if (c === 1) {
    for (i = 0; i < ms.length; i++) {
      var old = g[ms[i][1]];
      g[ms[i][1]] = g[ms[i][0]];
      ab = search.alphabeta(g, d-1, alpha, beta, -c);
      if (alpha < ab.value) {
        alpha = ab.value;
        m = [ms[i]].concat(ab.move);
      }
      g[ms[i][0]] = g[ms[i][1]];
      g[ms[i][1]] = old;
      if (beta <= alpha) break;
    }
    return {value: alpha, move: m};
  } else {
    for (i = 0; i < ms.length; i++) {
      var old = g[ms[i][1]];
      g[ms[i][1]] = g[ms[i][0]];
      ab = search.alphabeta(g, d-1, alpha, beta, -c);
      if (beta > ab.value) {
        beta = ab.value;
        m = [ms[i]].concat(ab.move);
      }
      g[ms[i][0]] = g[ms[i][1]];
      g[ms[i][1]] = old;
      if (beta <= alpha) break;
    }
    return {value: beta, move: m};
  }
}

search.genAllMoves = function(g, c) {
  var ms = [];
  g.forEach(function(x,idx) {
    if (x*c > 0) ms = ms.concat(search.genMoves(g, idx).map(function(y) {return [idx, y]}));
  });
  return ms;
}

search.genMoves = function(g, idx) {
  var p = g[idx], x = idx % 10, y = idx - x, i, k, ms = [];
  var type = Math.abs(p), c = type % 2;
  switch(type) {
  case 1: // B
    if (p > 0) {
      if (idx % 10 < 5) ms = [idx + 1];
      else ms = [idx - 10, idx + 1, idx + 10];
      ms = ms.filter(function(x1) {return x1 >= 0 && x1 < 90 && g[x1] <= 0});
    } else {
      if (idx % 10 > 4) ms = [idx - 1];
      else ms = [idx - 10, idx - 1, idx + 10];
      ms = ms.filter(function(x1) {return x1 >= 0 && x1 < 90 && g[x1] >= 0});
    }
    break;
  case 2: // S
    var tg = p > 0 ? score.TgW : score.TgB;
    ms = tg.filter(function(x1) {
      var delta = Math.abs(x1-idx);
      return (delta === 9 || delta === 11) && g[x1]*p <= 0;
    });
    break;
  case 3: // T
    var tg = p > 0 ? score.TW : score.TB;
    ms = tg.filter(function(x1) {
      var delta = Math.abs(x1-idx);
      return (delta === 22 || delta === 18) && g[x1]*p <= 0 && !g[(x1+idx)/2];
    });
    break;
  case 4: // M
    ms = [idx - 12, idx + 12, idx + 8, idx - 8, idx + 21, idx - 21, idx + 19, idx -19];
    ms = ms.filter(function(x1) {
      var distance = Math.pow(x1 % 10 - idx % 10, 2) + Math.pow(Math.floor(x1/10) - Math.floor(idx/10), 2);
      return x1 >= 0 && x1 < 90 && p*g[x1] <= 0 && !g[score.middle(idx,x1)] && distance === 5;
    });
    break;
  case 5: //c = 1 canon capture by jump over 1 piece
  case 6: //c = 0 unlike rook
    i = 9;
    do {
      if (g[y+i]*p <= 0) search.insertAfterCountCheck(g,ms,idx,y+i,c,true);
      k = i * 10 + x;
      if (k < 90 && g[k]*p <= 0) search.insertAfterCountCheck(g,ms,idx,k,c,false);
    } while (i--)
    break;
  case 7:
    var tg = p > 0 ? score.TgW : score.TgB;
    ms = tg.filter(function(x1) {
      var delta = Math.abs(x1-idx);
      return (delta === 1 || delta === 10) && g[x1]*p <= 0;
    });
    break;    
  }
  return ms;
}

search.insertAfterCountCheck = function(g,ms,x1,x2,c,adj) {
  var x0 = Math.min(x1, x2), x3 = Math.max(x1, x2), count = 0, x;
  if (adj) { // adjacent
    count = g.slice(x0+1, x3).filter(function(x) {return x}).length;
    console.log(x1, x2, count, c);
  } else {
    x = x0 + 10;
    while (x < x3) {
      if (g[x]) count++;
      x += 10;
    }
  }
  if ((g[x2] && (count === c)) || (!g[x2] && (count === 0))) ms.push(x2);
}

//console.log(search.genMoves(score.Board, 17).sort());

// export as node module
var module = module || {};
module.exports = score;
