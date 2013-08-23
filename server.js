var vnc = {};
vnc.Piece = {
  X: 9, Y: 10,
  color: ['black', 'white'],
  BLACK: 0, WHITE: 1,
  START: {
    Tg: 'a5', S: ['a4','a6'], T: ['a3','a7'], M: ['a2','a8'], X: ['a1','a9'],
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
    this.white = this.black = vnc.Piece.START;
    this.turn = vnc.Piece.WHITE - this.turn;
    this.history = [];
    if (wp && bp) {
      this.wplayer = wp;
      this.bplayer = bp;
    }
    this.init();
  };
  this.move = function(m) {
    console.log(this.color() + ': ' + m);
    this.history.push(m);
    this.turn = vnc.Piece.WHITE - this.turn;
  };
  this.init = function() {
    this.grid = new Array(vnc.Piece.Y);
    for (var i = 0; i < this.grid.length; i++) {
      this.grid[i] = new Array(vnc.Piece.X);
    }
    this.updateSide(vnc.Piece.WHITE);
    this.updateSide(vnc.Piece.BLACK);
  };
  this.updateSide = function(color) {
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
  // update('a5', 'Tg', WHITE) should set grid[9][4] = '1Tg'
  this.update = function(pos, type, color) {
    var x = parseInt(pos[1])-1;
    var y = Math.abs(color*(vnc.Piece.Y - 1) - vnc.Piece.LETTER.indexOf(pos[0]));
    this.grid[y][x] = type + color;
  };
};


var b = new vnc.Server('chung', 'son').board('son');
console.log(b.grid);

//b.move('P2-5'); b.move('P2-5');
//b.move('M2-3'); b.move('M8-7');
//console.log(b.black);
