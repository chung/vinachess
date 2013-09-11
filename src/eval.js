var vnc = vnc || {};

vnc.next = function(b, c) {
  if (c === undefined) return vnc.next(b, b.turn);
  return vnc.alphabeta(b, 2, -100000, 100000, c);
}

vnc.alphabeta =  function(b, d, alpha, beta, c) {
  //console.log('calling with d = ' + d + ', alpha = ' + alpha + ', beta = ' + beta + ', turn is ' + c);
  if (d === 0) return {value: vnc.eval(b), move: []};
  var ms = vnc.allMoves(b), m, ab, i;
  if (c === 1) {
    for (i = 0; i < ms.length; i++) {
      b.move(ms[i]);
      ab = vnc.alphabeta(b, d-1, alpha, beta, 1-c);
      if (alpha < ab.value) {
        alpha = ab.value;
        m = [ms[i]].concat(ab.move);
      }
      b.undo();
      if (beta <= alpha) break;
    }
    return {value: alpha, move: m};
  } else {
    for (i = 0; i < ms.length; i++) {
      b.move(ms[i]);
      ab = vnc.alphabeta(b, d-1, alpha, beta, 1-c);
      if (beta > ab.value) {
        beta = ab.value;
        m = [ms[i]].concat(ab.move);
      }
      b.undo();
      if (beta <= alpha) break;
    }
    return {value: beta, move: m};
  }
}

vnc.allMoves = function(b, t) {
  var side = vnc.pieces(b, b.turn), moves = [];
  if (t) {
    var ps = side[t];
    for (var i = 0; i < ps.length; i++) {
      moves = moves.concat(vnc.getMoves(b, t, ps[i]));
    }
    return moves;
  } else {
    for (var type in side) {
      moves = moves.concat(vnc.allMoves(b, type));
    }
  }
  return moves;
}

// getMoves(b, 'P', 'c2') = [P2-1, P2.1 ...]
vnc.getMoves = function(b, type, pos) {
  var ls = [], ms = [];
  switch(type) {
  case 'X':
  case 'P':
  case 'B':
  case 'Tg':
    for (var i = 0; i < vnc.Piece.Y; i++) {
      if (vnc.Piece.LETTER[i] !== pos[0]) {
        ls.push(vnc.Piece.LETTER[i] + pos[1]);
      }
    }
    for (var x = 1; x <= vnc.Piece.X; x++) {
      if (x !== +pos[1]) {
        ls.push(pos[0] + x);
      }
    }
    break;
  case 'M': ls = vnc.genMoves(pos, 1, 2).concat(vnc.genMoves(pos, 2, 1)); break;
  case 'T': ls = vnc.genMoves(pos, 2, 2); break;
  case 'S': ls = vnc.genMoves(pos, 1, 1); break;
  default: break;
  }
  for (var i = 0; i < ls.length; i++) {
    var m = vnc.Board.prototype.getMove.call(b, type+b.turn, pos, ls[i], b.turn);
    if (m) ms.push(m);
  }
  return ms;
}

vnc.genMoves = function(pos, x, y) {
  var ms = [];
  var px = +pos[1];
  var py = vnc.Piece.LETTER.indexOf(pos[0]);
  ms = ms.concat(vnc.genMove(px + x, py + y));
  ms = ms.concat(vnc.genMove(px + x, py - y));
  ms = ms.concat(vnc.genMove(px - x, py + y));
  ms = ms.concat(vnc.genMove(px - x, py - y));
  return ms;
}

vnc.genMove = function(x, y) {
  if (x > 0 && x <= vnc.Piece.X && y >= 0 && y < vnc.Piece.Y) {
    return [vnc.Piece.LETTER[y] + x];
  }
  return [];
}

// return a copy of all the pieces for color c
vnc.pieces = function(b, c) {
  return vnc.copy(b[vnc.color(c)]);
}

vnc.eval = function(b, c) {
  if (c === undefined) return vnc.eval(b, vnc.Piece.WHITE) - vnc.eval(b, vnc.Piece.BLACK);
  var value = 0, side = vnc.pieces(b, c);
  for (var type in side) {
    var ps = side[type];
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      var k = +p[1] - 1 + vnc.Piece.LETTER.indexOf(p[0]) * vnc.Piece.X;
      value += vnc.values[type][k] + vnc.valueOf(b, type);
    }
  }
  return value;
}

// count number of pieces left
vnc.count = function(b, c) {
  if (c === undefined) return vnc.count(b, vnc.Piece.WHITE) + vnc.count(b, vnc.Piece.BLACK);
  var value = 0, side = vnc.pieces(b, c);
  for (var type in side) {
    value += side[type].length;
  }
  return value;
}

vnc.valueOf = function(b, type) {
  b.count = b.count || vnc.count(b);
  switch(type) {
  case 'Tg': return 10000;
  case 'X': return 1000;
  case 'P': return 10 * b.count + 350;
  case 'M': return 700 - 10 * b.count;
  case 'T': return 300;
  case 'S': return 270;
  case 'B': return 100;
  default: return 0;
  }
}

// export as node module
var module = module || {};
module.exports = vnc;