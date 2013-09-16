var search = {};
var score = score || require('./score.js');

search.evaluate = function(g) {
  var v = 0, i = 89;
  do {
    v += search.value(g, i);
  } while(i--)
  return v;
}

search.value = function(g, i) {
  if (g[i] > 0) {
    return score.pvalue[g[i]][i] + score.mvalue[g[i]];
  } else if (g[i] < 0) {
    return -score.pvalue[-g[i]][89-i] - score.mvalue[-g[i]];
  }
  return 0;
}

search.moveValue = function(g, m) {
  var before, after, capture, i = m[0], j = m[1];
  before = search.value(g, i) + search.value(g, j);
  capture = g[j];
  g[j] = g[i]; g[i] = 0;
  after = search.value(g, i) + search.value(g, j);
  // undo move:
  g[i] = g[j]; g[j] = capture;
  return after - before;
}

search.move = function(g, ms) {
  for (i = 0; i < ms.length; i++) {
    g[ms[i][1]] = g[ms[i][0]];
    g[ms[i][0]] = 0;
  }
  return g;
}

search.eval = function(b) {
  return search.evaluate(search.convert(b));
}

search.next = function(b) {
  var g = search.convert(b);
  return search.psv(g, 4, -100000, 100000, b.turn ? 1 : -1);
}

// convert from traditional board to grid
search.convert = function(b) {
  var g = new Array(90);
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 9; j++) {
      var k = 10*j + 9-i;
      switch(b.grid[i][j]) {
        case 'B1': g[k] = 1; break;
        case 'B0': g[k] = -1; break;
        case 'S1': g[k] = 2; break;
        case 'S0': g[k] = -2; break;
        case 'T1': g[k] = 3; break;
        case 'T0': g[k] = -3; break;
        case 'M1': g[k] = 4; break;
        case 'M0': g[k] = -4; break;
        case 'P1': g[k] = 5; break;
        case 'P0': g[k] = -5; break;
        case 'X1': g[k] = 6; break;
        case 'X0': g[k] = -6; break;
        case 'Tg1': g[k] = 7; break;
        case 'Tg0': g[k] = -7; break;
        default: g[k] = 0; break;
      }
    }
  }
  return g;
}

search.history = {};
// negascout: http://en.wikipedia.org/wiki/Negascout
search.psv = function(g, d, alpha, beta, c, bestMove) {
  if (d === 0) return {value: c*search.evaluate(g), move: []};
  var ms = search.genAllMoves(g, c), m, ab, v, i, old;
  if (bestMove) ms = [bestMove].concat(ms);
  for (i = 0; i < ms.length; i++) {
    old = g[ms[i][1]];
    g[ms[i][1]] = g[ms[i][0]];
    g[ms[i][0]] = 0;
    ab = search.psv(g, d-1, -alpha-1, -alpha, -c);
    v = -ab.value;
    if (v > alpha && v < beta && i > 0) {
      ab = search.psv(g, d-1, -beta, -alpha, -c);
    }
    g[ms[i][0]] = g[ms[i][1]];
    g[ms[i][1]] = old;
    if (alpha < -ab.value) {
      alpha = -ab.value;
      m = [ms[i]].concat(ab.move);
    }
    if (alpha >= beta) {
      // history heuristics implementation
      //var key = JSON.stringify(m[i]);
      //search.history[key] = search.history[key] ? search.history[key] + d*d : d*d;
      break;
    }
  }
  return {value: alpha, move: m};
}


search.negamax = function(g, d, alpha, beta, c) {
  if (d === 0) return {value: c*search.evaluate(g), move: []};
  var ms = search.genAllMoves(g, c), m, ab, v, i, old;

  for (i = 0; i < ms.length; i++) {
    old = g[ms[i][1]];
    g[ms[i][1]] = g[ms[i][0]];
    g[ms[i][0]] = 0;
    ab = search.negamax(g, d-1, -beta, -alpha, -c);
    g[ms[i][0]] = g[ms[i][1]];
    g[ms[i][1]] = old;
    v = -ab.value;
    if (v >= beta) {
      return {value: v, move: [ms[i]].concat(ab.move)};
    }
    if (v > alpha) {
      m = [ms[i]].concat(ab.move);
      alpha = v;
    }
  }
  return {value: alpha, move: m};
}

search.alphabeta =  function(g, d, alpha, beta, c, move) {
  if (d === 0) return {value: search.evaluate(g), move: []};
  var ms = search.genAllMoves(g, c), m, ab, i, old;

  for (i = 0; i < ms.length; i++) {
    move = (move && i === 0) ? move : ms[i];
    old = g[move[1]];
    g[move[1]] = g[move[0]];
    g[move[0]] = 0;
    ab = search.alphabeta(g, d-1, alpha, beta, -c);
    g[move[0]] = g[move[1]];
    g[move[1]] = old;

    if (c > 0 && alpha < ab.value) {
      alpha = ab.value;
      m = [move].concat(ab.move);
    } else if (c < 0 && beta > ab.value) {
      beta = ab.value;
      m = [move].concat(ab.move);
    }
    if (beta <= alpha) {
      break;
    }
  }
  return {value: c>0 ? alpha : beta, move: m};
}

search.mtdf = function(g, d, f, c) {
  var ub = 100000, lb = -100000, fg = f, ab, beta;
  do {
    beta = (fg === lb) ? beta = fg + 1 : fg;
    ab = search.abmem(g, d, beta-1, beta, c);
    if (ab < beta) ub = ab;
    else lb = ab;
  } while (lb < ub)
  return ab;
}

// alpha beta with memory
search.tt = {}; // transposition table
search.abmem =  function(g, d, alpha, beta, c) {
  var ms = search.genAllMoves(g, c), m, ab, i, old, v, a, b, r;
  var key = JSON.stringify(g);
  var hv = search.tt[key];
  if (hv && hv.depth >= d) {
    if (hv.alpha >= beta) return hv.alpha;
    else if (hv.beta <= alpha) return hv.beta;
    alpha = Math.max(alpha, hv.alpha);
    beta = Math.min(beta, hv.beta);
  }
  if (d === 0) {
    v = search.evaluate(g);
  } else if (c > 0) {
    v = -100000; a = alpha;
    for (i = 0; i < ms.length; i++) {
      old = g[ms[i][1]];
      g[ms[i][1]] = g[ms[i][0]];
      g[ms[i][0]] = 0;
      ab = search.abmem(g, d-1, a, beta, -c);
      g[ms[i][0]] = g[ms[i][1]];
      g[ms[i][1]] = old;
   
      v = Math.max(v, ab);
      a = Math.max(a, v);
      if (v >= beta) break;
    }
  } else {
    v = 100000; b = beta;
    for (i = 0; i < ms.length; i++) {
      old = g[ms[i][1]];
      g[ms[i][1]] = g[ms[i][0]];
      g[ms[i][0]] = 0;
      ab = search.abmem(g, d-1, alpha, b, -c);
      g[ms[i][0]] = g[ms[i][1]];
      g[ms[i][1]] = old;
   
      v = Math.min(v, ab);
      b = Math.min(b, v);
      if (v <= alpha) break;
    }
  }
  if (v <= alpha) b = v;
  else if (v >= beta) a = v;
  else { a = v; b = v; }
  r = {depth: d, alpha: a, beta: b};
  search.tt[key] = r;
  console.log(JSON.stringify(r));

  return v;
}

search.genAllMoves = function(g, c) {
  var ms = [];
  g.forEach(function(x,idx) {
    if (x*c > 0) ms = ms.concat(search.genMoves(g, idx).map(function(y) {return [idx, y]}));
  });
  return ms;
  //return ms.sort(function(a, b) { return c*search.moveValue(g, b) - c*search.moveValue(g, a); });
  //return ms.sort(function(a, b) { return (search.history[JSON.stringify(b)] || 0) - (search.history[JSON.stringify(a)] || 0); });
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
  } else {
    x = x0 + 10;
    while (x < x3) {
      if (g[x]) count++;
      x += 10;
    }
  }
  if ((g[x2] && (count === c)) || (!g[x2] && (count === 0))) ms.push(x2);
}


// export as node module
var module = module || {};
module.exports = score;
