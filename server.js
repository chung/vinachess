var vnc = {};
vnc.Piece = {
  color: ['black', 'white'],
  WHITE: 1,
  BLACK: 0,
  START: {
    Tg: 'a5', S: ['a4','a6'], T: ['a3','a7'], M: ['a2','a8'], X: ['a1','a9'],
    B: ['d1','d3','d5','d7','d9'], P: ['c2','c8']
  }
};

vnc.Server = function() {
  this.board = new vnc.Board();
  this.users = [];
  this.join = function(person) {
    this.users.push(person);
    if (this.users.length >= 2) {
      this.board.newGame(this.users);
    }
  };
};

vnc.Board = function() {
  this.turn = 0;
  this.color = function() { return vnc.Piece.color[this.turn]; };
  this.history = [];
  this.newGame = function(users) {
    this.white = this.black = vnc.Piece.START;
    this.turn = vnc.Piece.WHITE - this.turn;
    this.history = [];
    if (users) {
      this.wplayer = users[0];
      this.bplayer = users[1];
    }
  };
  this.move = function(m) {
    console.log(this.color() + ': ' + m);
    this.history.push(m);
    this.turn = vnc.Piece.WHITE - this.turn;
  };
};


var b = new vnc.Server().board;
b.newGame();
b.move('P2-5'); b.move('P2-5');
b.move('M2-3'); b.move('M8-7');


//console.log(s.board.black);
