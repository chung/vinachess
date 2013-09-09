var vnc = {};

vnc.copy = function(o) { return JSON.parse(JSON.stringify(o)); };
// rotate(a1) = j9
vnc.rotate = function(pos) {
  var x = vnc.Piece.X + 1 - pos[1];
  var y = vnc.Piece.Y - 1 - vnc.Piece.LETTER.indexOf(pos[0]);
  return vnc.Piece.LETTER[y] + x;
}
// mirror(grid)
vnc.mirror = function(grid) {
  var mgrid = new Array(vnc.Piece.Y);
  for (var i = 0; i < mgrid.length; i++) {
    mgrid[i] = [grid[i][8],grid[i][7],grid[i][6],grid[i][5],grid[i][4],grid[i][3],grid[i][2],grid[i][1],grid[i][0]];
  }
  return mgrid;
}

vnc.MOVE_REGEX = /([X|P|M|S|T|B][t|g|s]*)(\d)([\.|\-|\/])(\d)/gm;

// neutralize a note so it makes sense for mirror board
// it looks for move specific string such as P2-5 and
// replaces with mirror position such as P8-5
vnc.neutralize = function(note) {
  if (!note) return '';
  return note.replace(vnc.MOVE_REGEX, function(m, p1, p2, p3, p4) {
    var type = p1.replace(/t|s/g, '');
    var specialPieces = (type === 'M' || type === 'S' || type === 'T');
    if (!specialPieces && p3 !== '-') {
      return p1 + (vnc.Piece.X+1-p2) + p3 + p4;
    } else {
      return p1 + (vnc.Piece.X+1-p2) + p3 + (vnc.Piece.X+1-p4);
    }
  });
}

vnc.Piece = {
  X: 9, Y: 10,
  color: ['black', 'white'],
  BLACK: 0, WHITE: 1,
  START: {
    Tg: ['a5'], S: ['a4','a6'], T: ['a3','a7'], M: ['a2','a8'], X: ['a1','a9'],
    B: ['d1','d3','d5','d7','d9'], P: ['c2','c8']
  },
  LETTER: 'abcdefghij' // for Y axis
};


vnc.Server = function(restore) {
  // only restore the boards
  this.boards = restore ? restore.boards : {};
  // always let users reconnect
  this.users = [];

  this.join = function(person, room) {
    var room = room || 'public';
    this.users.push(person);
    if (!this.boards[room]) {
        this.boards[room] = new vnc.Board();
        this.boards[room].newGame();
    }
  };

  this.unjoin = function(person) {
    var index = this.users.indexOf(person);
    if (index >= 0) {
      this.users.splice(index, 1);
    }
  };

  this.board = function(room) {
    var room = room || 'public';
    return this.boards[room];
  };

  for (var i = 0; i < arguments.length; i++) {
    this.join(arguments[i]);
  };
};


vnc.Board = function() {
  this.turn = 0;
};

vnc.Board.prototype.newGame = function(white, black, turn) {
  this.white = vnc.copy(white || vnc.Piece.START);
  this.black = vnc.copy(black || vnc.Piece.START);
  this.turn = turn === undefined ? vnc.Piece.WHITE : turn;
  this.lastMove = {};
  this.history = [];
  this.paths = [];
  this.path = 0;
  this.paths.push(this.history);
  vnc.Board.prototype.init.call(this);
  this.index = 0;
  this.history[this.index] = { move: '',
                             white: vnc.copy(this.white),
                             black: vnc.copy(this.black),
                             grid:  vnc.copy(this.grid)};
  return this;
};

vnc.Board.prototype.loadGame = function(data) {
  if (this.history.length > 1) return this; // only load at new game
  var b = this; // need this closure below
  data.replace(vnc.MOVE_REGEX, function(m) {
    console.log(m);
    vnc.Board.prototype.move.call(b, m);
  });
  return this;
};

vnc.color = function(c) { return vnc.Piece.color[c] };
vnc.Board.prototype.color = function(c) { return vnc.color(c || this.turn); };

// parse('P2-5') = {from: 'c2', to: 'c5', type: 'P'}
vnc.parse = function(board, move, color) {
  var ma = move.match(vnc.MOVE_REGEX.source);
  var type = ma[1].replace(/t|s/g, ''), x1 = +ma[2], op = ma[3], x2 = +ma[4];
  var locs = board[vnc.color(color)][type].sort(); // locations of pieces sorted
  var inc = 1, start = 0, skip = 0, idx;
  if (move.indexOf('t') >= 0) {
    inc = -1; start = locs.length - 1;
    if (move.indexOf('tsss') >= 0) skip = 3;
    else if (move.indexOf('tss') >= 0) skip = 2;
    else if (move.indexOf('ts') >= 0) skip = 1; // very unlikely, but possible
  }
  for (var i = start; i < locs.length && i >= 0; i += inc) {
    var loc = locs[i];
    ma = loc.match(/(\w+)(\d)/);
    if (+ma[2] === x1) { // found a matching
      if (skip > 0) {
        skip -= 1;
        continue;
      }
      var from = to = loc, x = x2;
      // move side way
      if (op === '-') {
        to = ma[1] + x;
      } // forward or backward
      else if (op === '.' || op === '/') {
        var inc = x2;
        var letter = vnc.Piece.LETTER;
        if (type === 'T') {
          inc = 2;
        } else if (type === 'S') {
          inc = 1;
        } else if (type === 'M') {
          inc = 3 - Math.abs(x1-x2);
        } else {
          x = x1;
        }
        idx = letter.indexOf(ma[1]) + (op === '.' ? inc : -inc);
        to = letter[idx] + x;
      }
      return {type: type, from: from, to: to};
    }
  }
  // FIXME: should throw error if still here ?
  console.log('Error: no matching for move: ' + move);
};

vnc.Board.prototype.move = function(m) {
  var mv = vnc.parse(this, m, this.turn);
  vnc.Board.prototype.update.call(this, mv.from, null, this.turn);
  vnc.Board.prototype.update.call(this, mv.to, mv.type, this.turn);
  // get all piece of this type
  var ps = this[vnc.color(this.turn)][mv.type];
  // replace the old position with new position
  ps.splice([ps.indexOf(mv.from)], 1, to);
  this.turn = vnc.Piece.WHITE - this.turn;
  // need to remove the captured piece if any:
  var x = vnc.Piece.X + 1 - mv.to[1];
  var y = vnc.Piece.Y - 1 - vnc.Piece.LETTER.indexOf(mv.to[0]);
  var lastPos = vnc.Piece.LETTER[y] + x;
  this.lastMove.from = this.turn ? mv.from : vnc.rotate(mv.from);
  this.lastMove.to = this.turn ? mv.to : vnc.rotate(mv.to);
  var p = vnc.Board.prototype.find.call(this, lastPos);
  if (p) { // piece captured
    // remove the piece from its collection
    this[vnc.color(this.turn)][p.type].splice(p.index, 1);
  }
  this.index += 1;
  // check if just created a new path:
  if (this.index < this.history.length && m != this.history[this.index].move) {
    this.paths.push(vnc.copy(this.history));
    this.history.splice(this.index, this.history.length - this.index);
  }
  this.history[this.index] = { move: m,
                               white: vnc.copy(this.white),
                               black: vnc.copy(this.black),
                               grid:  vnc.copy(this.grid)};
  return this;
};

vnc.Board.prototype.undo = function() {
  if (this.index > 0) {
    return vnc.Board.prototype.select.call(this, this.index-1, this.path);
  }
  return this;
};

vnc.Board.prototype.redo = function() {
  if (this.index < this.history.length-1) {
    return vnc.Board.prototype.select.call(this, this.index+1, this.path);
  }
  return this;
};

// select a random move at index of path
vnc.Board.prototype.select = function(idx, path) {
  // first switch to the correct path
  if (path !== undefined) this.path = path;
  this.history = this.paths[this.path];
  // then locate the correct move
  if (idx < this.history.length && idx >= 0) {
    if (Math.abs(this.index-idx) % 2) this.turn = vnc.Piece.WHITE - this.turn;
    this.index = idx;
    var hist = this.history[this.index];
    this.grid  = vnc.copy(hist.grid);
    this.white = vnc.copy(hist.white);
    this.black = vnc.copy(hist.black);
    this.lastMove = {}; // FIXME: get appropriate last move
  }
  return this;
};


// find a piece at this position for the color pieces
// if no color specified, use the current color of the board (turn)
vnc.Board.prototype.find = function(pos, color) {
  var all = this[vnc.color(color || this.turn)];
  for (var type in all) {
    var idx = all[type].indexOf(pos);
    if (idx >= 0) {
      return {index: idx, pos: pos, type: type};
    }
  }
}

vnc.Board.prototype.init = function() {
  this.grid = new Array(vnc.Piece.Y);
  for (var i = 0; i < this.grid.length; i++) {
    this.grid[i] = new Array(vnc.Piece.X);
  }
  vnc.Board.prototype.updateAll.call(this, vnc.Piece.WHITE);
  vnc.Board.prototype.updateAll.call(this, vnc.Piece.BLACK);
};

vnc.Board.prototype.updateAll = function(color) {
  var pieces = color ? this.white : this.black;
  for (var p in pieces) {
    var pos = pieces[p];
    if (typeof(pos) === 'string') {
      vnc.Board.prototype.update.call(this, pos, p, color);
    } else if (pos.length) {
      for (var k = 0; k < pos.length; k++) {
        vnc.Board.prototype.update.call(this, pos[k], p, color);
      }
    }
  }
};


// update('c2', 'P', WHITE) should set grid[7][7] = 'P1'
// update('c2', 'P', BLACK) should set grid[2][1] = 'P0'
vnc.Board.prototype.update = function(pos, type, color) {
  var p = vnc.Board.prototype.translate(pos, color);
  this.grid[p.y][p.x] = type ? (type + color) : null;
};

vnc.Board.prototype.toHtml = function(color) {
  var html = '', starty = 0, startx = 0, incy = 1, incx = 1, c = color ? vnc.Piece.WHITE : vnc.Piece.BLACK;
  if (c) {
    starty = vnc.Piece.Y - 1;
    startx = vnc.Piece.X - 1;
    incy = incx = -1;
  }
  for (var y = starty; y < vnc.Piece.Y && y >= 0; y += incy) {
    for (var x = startx; x < vnc.Piece.X && x >= 0; x += incx) {
      var type = this.grid[y][x] || '';
      // FIXME: perform less tricky rotate for easier understanding
      // absolute position used for drawing piece
      var absPos = vnc.Piece.LETTER[Math.abs((vnc.Piece.Y-1)*c - y)] + Math.abs((vnc.Piece.X+1)*c - x - 1);
      // relative position, used for hightlight move
      var relPos = color ? vnc.rotate(absPos) : absPos;
      var hilight = (this.lastMove.from === relPos ? ' from' : '');
      hilight += (this.lastMove.to === relPos ? ' to' : '')
      var klass = "piece " + absPos + ' ' + type + hilight;
      html += '<div class="' + klass + '" onclick="handleClick(this,\'' + absPos + '\',\'' + type + '\');"></div>';
      //console.log('.' + absPos + ' { left: ' + (8 + 51*x)+ 'px; top: ' + (8 + 50.5*y) + 'px; }');
    }
    html += '\n';
  }
  return html;
};

vnc.max = function(a) { return Math.max.apply(null, a.map(function(p) { return p.length })); };

vnc.Board.prototype.getMoves = function() {
  var html = '<table border="0" cellpadding="2"><tr><th>#</th>';
  var nmax = vnc.max(this.paths);
  var moves = new Array(nmax), move;
  var td;
  var moveSpan = function(board, idx, pid) {
    if (!board.paths[pid][idx]) return '<td></td>';
    move = board.paths[pid][idx].move;
    td = '<td onclick="selectMove(' + idx + ',' + pid + ');" class="move';
    if (move === moves[idx]) td += ' moved';
    moves[idx] = move;
    if (pid === board.path) {
      td += ' curpath';
      if (idx === board.index) td += ' selected';
    }
    td += '">' + move + '</td>';
    return td;
  };
  this.paths.forEach(function(p) { html += '<th>WHITE</th><th>BLACK</th>'; });
  html += '</tr>';
  // trying to sort paths
  var pathsMap = {};
  this.paths.forEach(function(path, idx) {
    var allMoves = '';
    path.forEach(function(m) { allMoves += m.move });
    pathsMap[allMoves] = idx;
  });
  var sortedPaths = Object.keys(pathsMap).sort();
  var curRow = Math.floor((this.index+1)/2);
  for (var i = 1; i < nmax; i += 2) {
    html += '<tr>';
    var row = (i+1)/2;
    var rowClass = curRow === row ? ' curpath' : '';
    for (var j = 0; j < sortedPaths.length; j++) {
      var p = pathsMap[sortedPaths[j]];
      if (j === 0) html += '<td class="movenumber' + rowClass + '">' + row + '</td>';
      html += moveSpan(this, i, p) + moveSpan(this, i+1, p);
    }
    html += '</tr>';
  }
  return html + '</table>';
};

// getMove(P1, h8, h7) = 'P2-3'
// getMove(P0, c2, c6) = 'P2-6'
vnc.Board.prototype.getMove = function(type, from, to, rotation) {
  if (rotation) {
    from = vnc.rotate(from);
    to = vnc.rotate(to);
  }
  var c = +type[type.length-1]; // color: 0 for black, 1 for white
  var t = type.substring(0, type.length-1); // piece type: M, X, P etc
  var mid = vnc.Board.prototype.middle;
  var tr = vnc.Board.prototype.translate;
  var count = vnc.Board.prototype.countPiecesInBetween;
  var p1 = tr(from);
  var p2 = tr(to);
  var t1 = this.grid[p1.y][p1.x];
  var t2 = this.grid[p2.y][p2.x] || '';
  if (!t1) return null; // nothing to move
  if (t2.indexOf(c) >= 0) return null; // trying to capture same color piece

  // FIXME: this only work if 2 piece max at the same column (only B can have 3 or more)
  var beforeAfter = ''; // if same column, append t or s if before or after, leave blank for middle
  var all = this[vnc.Piece.color[c]][t].sort(); // all piece of the same type
  var col = tr(from, c).x + 1; // get the right column to get before & after notation
  var row = vnc.Piece.LETTER[tr(from, c).y]; // get the right alphabet
  for (var i = 0; i < all.length; i++) {
    var p = all[i];
    if (p.indexOf(col) >= 0) {
      if (p[0] > row) beforeAfter += 's';
      else if (p[0] < row) beforeAfter += 't';
    }
  }
  var sign = 1 - 2*c; // White = -1, Black = 1
  var movex = Math.pow(p2.x - p1.x, 2);
  var movey = Math.pow(p2.y - p1.y, 2);
  var oneStepOnly = (movex+movey) === 1;
  var threeStepsL = (movex+movey) === 5;
  var bigDiagonal = (movex+movey) === 8;
  var smallDiagonal = (movex+movey) === 2;
  var withinPalace = [3,4,5].indexOf(p2.x) >= 0 && [0,1,2,7,8,9].indexOf(p2.y) >= 0;
  var blockingPiece = this.grid[mid(p1.y, p2.y)][mid(p1.x, p2.x)];
  var behindRiver = sign * (p2.y - 4.5) < 0;
  var straightLine = movex === 0 || movey === 0;
  var countInBetween = count(this.grid, p1.x, p1.y, p2.x, p2.y);
  var movable = false;
  var theMove = t + beforeAfter + (tr(from, c).x + 1); // first part P2 of move string P2-5

  var move = Math.abs(p2.y - p1.y);
  var newx = tr(to, c).x + 1;
  if (t === 'B') {
    var forwardOnly = sign * (p1.y - p2.y) <= 0;
    var sidewayOkAfterRiver = sign * (p1.y - 4.5) * movex >= 0;
    movable = oneStepOnly && forwardOnly && sidewayOkAfterRiver;
  }
  else if (t === 'Tg') {
    movable = oneStepOnly && withinPalace;
  }
  else if (t === 'M') {
    movable = threeStepsL && !blockingPiece;
    move = newx;
  }
  else if (t === 'T') {
    movable = bigDiagonal && !blockingPiece && behindRiver;
    move = newx;
  }
  else if (t === 'S') {
    movable = smallDiagonal && withinPalace;
    move = newx;
  }
  else if (t === 'X') {
    movable = straightLine && countInBetween === 0;
  }
  else if (t === 'P') {
    // capturing: PAO jumps over 1 piece to capture
    if (t2 && t2.indexOf(c) < 0) {
      movable = straightLine && countInBetween === 1;
    } else {
      // otherwise move like CHE
      movable = straightLine && countInBetween === 0;
    }
  }

  if (movable) {
    if (movey === 0) {
      theMove += '-';
      move = newx;
    } else {
      theMove += ((p2.y - p1.y) * sign > 0) ? '.' : '/';
    }
    theMove += move;
  }
  return movable ? theMove : null;
};

// translate('c2', 1) to {x:7, y:7}
vnc.Board.prototype.translate = function(pos, color) {
  var x = +pos[1] - 1;
  var y = vnc.Piece.LETTER.indexOf(pos[0]);
  if (color) {
    x = vnc.Piece.X - 1 - x;
    y = vnc.Piece.Y - 1 - y;
  }
  return {x: x, y: y};
};

// return the middle point to calculate the blocking piece for M & T
vnc.Board.prototype.middle = function(x1, x2) {
  var m = Math.floor((x1 + x2)/2);
  return (x1 > x2) ? (m + x1 + x2 - 2*m) : m;
}

vnc.Board.prototype.countPiecesInBetween = function(grid, a1, b1, a2, b2) {
  var c = 0;
  if (a1 == a2) {
    var inc = (b1 < b2) ? 1 : -1;
    for (var b = b1 + inc; b !== b2; b += inc) {
      if (grid[b][a1]) { c += 1; }
    }
  }
  else if (b1 == b2) {
    var inc = (a1 < a2) ? 1 : -1;
    for (var a = a1 + inc; a !== a2; a += inc) {
      if (grid[b1][a]) { c += 1; }
    }
  }
  return c;
};

// export as node module
var module = module || {};
module.exports = vnc;
