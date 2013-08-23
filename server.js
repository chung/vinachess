var vnc = {};

vnc.Server = function() {
  this.board = {
    white: {},
    black: {},
    turn: 'white',
    wplayer: 'chung',
    bplayer: 'son',
    history: []
  };
  
  this.move = function(m) {
    console.log(m);
  }

};