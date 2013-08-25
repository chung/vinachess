var vnc = {};
vnc.Piece = {
  X: 9, Y: 10,
  color: ['black', 'white'],
  BLACK: 0, WHITE: 1,
  START: {
    Tg: ['a5'], S: ['a4','a6'], T: ['a3','a7'], M: ['a2','a8'], X: ['a1','a9'],
    B: ['d1','d3','d5','d7','d9'], P: ['c2','c8']
  },
  LETTER: 'abcdefghij'
};


vnc.Server = function() {
  this.boards = [];
  this.users = [];

  this.join = function(person) {
    this.users.push(person);
    if (this.users.length >= 2) {
      var b = new vnc.Board();
      b.newGame(this.users[0], this.users[1]);
      this.boards.push(b);
    }
  };

  this.board = function(person) {
    for (var i = 0; i < this.boards.length; i++) {
      var b = this.boards[i];
      if (b.wplayer === person || b.bplayer === person) {
        return b;
      }
    }
  };

  this.process = function(data) {
    var b = this.board(data.person);
    if ((b.turn === vnc.Piece.WHITE && b.wplayer === data.person) ||
        (b.turn === vnc.Piece.BLACK && b.bplayer === data.person)) {
      b.move(data.move);
    }
  };

  for (var i = 0; i < arguments.length; i++) {
    this.join(arguments[i]);
  };
};


vnc.Board = function() {
  this.turn = 0;
  this.color = function() { return vnc.Piece.color[this.turn]; };

  this.newGame = function(wp, bp) {
    this.white = JSON.parse(JSON.stringify(vnc.Piece.START));
    this.black = JSON.parse(JSON.stringify(vnc.Piece.START));
    this.turn = vnc.Piece.WHITE;// - this.turn;
    this.history = [];
    if (wp && bp) {
      this.wplayer = wp;
      this.bplayer = bp;
    }
    this.init();
  };

  // parse('P2-5') = {from: 'c2', to: 'c5', type: 'P'}
  this.parse = function(m) {
    var re = /(\w+)(\d)([\.|\-|\/])(\d)/;
    var ma = m.match(re);
    var type = ma[1], x1 = ma[2], op = ma[3], x2 = ma[4];
    var locs = this[this.color()][type]; // locations of pieces

    for (var i = 0; i < locs.length; i++) {
      var loc = locs[i];
      ma = loc.match(/(\w+)(\d)/);
      if (ma[2] === x1) { // found a matching
        var from = to = loc, x = x2;
        // move side way
        if (op === '-') {
          to = ma[1] + x;
        } // forward or backward
        else if (op === '.' || op === '/') {
          var inc = parseInt(x2);
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
          var index = letter.indexOf(ma[1]) + (op === '.' ? inc : -inc);
          to = letter[index] + x;
        }
        return {type: type, from: from, to: to};
      }
    }
    // FIXME: should throw error if still here ?
    console.log('Error: no matching for move: ' + this.color() + m);
  };

  this.move = function(m) {
    var mv = this.parse(m);
    this.update(mv.from, null, this.turn);
    this.update(mv.to, mv.type, this.turn);
    // get all piece of this type
    var ps = this[this.color()][mv.type];
    // replace the old position with new position
    ps.splice([ps.indexOf(mv.from)], 1, to);
    this.history.push(m);
    this.turn = vnc.Piece.WHITE - this.turn;
    // need to remove the captured piece if any:
    var x = vnc.Piece.X + 1 - parseInt(mv.to[1]);
    var y = vnc.Piece.Y - 1 - vnc.Piece.LETTER.indexOf(mv.to[0]);
    var p = this.find(vnc.Piece.LETTER[y] + x);
    if (p) { // piece captured
      // remove the piece from its collection
      this[this.color()][p.type].splice(p.index, 1);
    }
    return this;
  };

  // find a piece at this position for the color pieces
  // if no color specified, use the current color of the board (turn)
  this.find = function(pos, color) {
    var all = this[color || this.color()];
    for (var type in all) {
    var index = all[type].indexOf(pos);
      if (index >= 0) {
        return {index: index, pos: pos, type: type};
      }
    }
  }

  this.init = function() {
    this.grid = new Array(vnc.Piece.Y);
    for (var i = 0; i < this.grid.length; i++) {
      this.grid[i] = new Array(vnc.Piece.X);
    }
    this.updateAll(vnc.Piece.WHITE);
    this.updateAll(vnc.Piece.BLACK);
  };

  this.updateAll = function(color) {
    var pieces = color ? this.white : this.black;
    for (var p in pieces) {
      var pos = pieces[p];
      if (typeof(pos) === 'string') {
        this.update(pos, p, color);
      } else if (pos.length) {
        for (var k = 0; k < pos.length; k++) {
          this.update(pos[k], p, color);
        }
      }
    }
  };

  // update('c2', 'P', WHITE) should set grid[7][7] = 'P1'
  // update('c2', 'P', BLACK) should set grid[2][1] = 'P0'
  this.update = function(pos, type, color) {
    var x = Math.abs(color * (vnc.Piece.X - 1) - (parseInt(pos[1]) - 1));
    var y = Math.abs(color * (vnc.Piece.Y - 1) - vnc.Piece.LETTER.indexOf(pos[0]));
    this.grid[y][x] = type ? (type + color) : '';
  };

  this.toHtml = function() {
    var html = '';
    for (var y = 0; y < vnc.Piece.Y; y++) {
      for (var x = 0; x < vnc.Piece.X; x++) {
        var type = this.grid[y][x];
        var pos = vnc.Piece.LETTER[y] + (x+1);
        var klass = "piece " + type + ' ' + pos;
        html += '<div class="' + klass + '"></div>';
        //console.log('.' + pos + ' { left: ' + (8 + 51*x)+ 'px; top: ' + (8 + 50.5*y) + 'px; }');
      }
      html += '\n';
    }
    return html;
  }
};


//var b = new vnc.Server('chung', 'son').board('son').move('P2-5').move('P2-5').move('P5.4');
//console.log(b.grid);
