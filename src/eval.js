var vnc = vnc || {};

vnc.next = function(b, c) {
  if (c === undefined) return vnc.next(b, b.turn);
  return vnc.alphabeta(b, 4, -100000, 100000, c);
}

vnc.alphabeta =  function(b, d, alpha, beta, c) {
  if (d === 0) return {value: vnc.eval(b)};
  var ms = vnc.allMoves(b), m;
  if (c === 1) {
    for (var i = 0; i < ms.length; i++) {
      m = ms[i];
      b.move(m);
      alpha = Math.max(alpha, vnc.alphabeta(b, d-1, alpha, beta, 1-c).value);
      b.undo();
      if (beta <= alpha) break;
    }
    return {value: alpha, move: m};
  } else {
    for (var i = 0; i < ms.length; i++) {
      m = ms[i];
      b.move(m);
      beta = Math.min(beta, vnc.alphabeta(b, d-1, alpha, beta, 1-c).value);
      b.undo();
      if (beta <= alpha) break;
    }
    return {value: beta, move: m};
  }
}

vnc.allMoves = function(b) {
  var side = b[vnc.color(b.turn)], moves = [];
  for (var type in side) {
    var ps = side[type];
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      moves = moves.concat(vnc.getMoves(b, type, p));
    }
  }
  return moves;  
}

// getMoves(b, 'P', 'c2') = [P2-1, P2.1 ...]
vnc.getMoves = function(b, type, pos) {
  switch(type) {
  case 'Tg': return [];
  case 'X': return [];
  case 'P':
    var ls = [], ms = [];
    for (var i = 0; i < vnc.Piece.Y; i++) {
      if (vnc.Piece.LETTER[i] !== pos[0]) {
        ls.push(vnc.Piece.LETTER[i] + pos[1]);
      }
    }
    for (var i = 0; i < vnc.Piece.X; i++) {
      if (i !== +pos[1]) {
        ls.push(pos[0] + i);
      }
    }
    for (var i = 0; i < ls.length; i++) {
      var m = vnc.Board.prototype.getMove.call(b, type+b.turn, pos, ls[i], b.turn);
      if (m) ms.push(m);
    }
    return ms;
  case 'M': return [];
  case 'T': return [];
  case 'S': return [];
  case 'B': return [];
  default: return [];
  }
  return [];
}

vnc.eval = function(b, c) {
  if (c === undefined) return vnc.eval(b, vnc.Piece.WHITE) - vnc.eval(b, vnc.Piece.BLACK);
  var value = 0, side = b[vnc.color(c)];
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
  var value = 0, side = b[vnc.color(c)];
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