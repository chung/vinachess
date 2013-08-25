beforeEach(function() {
  this.addMatchers({
	movable: function(x, y) {
	  var origin = this.actual;
	  var board = origin.board;
	  var piece = board.at(origin.x, origin.y);
	  board.click(origin.x, origin.y);
	  board.click(x, y);
	  return board.at(x, y) === piece;
	},
    started: function() {
      var b = this.actual;
      return b.turn === vnc.Piece.WHITE &&
             JSON.stringify(b.white) === JSON.stringify(vnc.Piece.START) &&
             JSON.stringify(b.black) === JSON.stringify(vnc.Piece.START);
    }
  });
});
