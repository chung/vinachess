describe("Chess board", function() {
  var board;
  beforeEach(function() {
    board = new bq.Chessboard();
    board.render();
    board.newGame();
  });

  it("should have its grid initialized", function() {
    expect(board.grid_).toNotEqual(undefined);
  });

  it("should have the pieces placed correctly", function() {
    var blackChe1 = board.at(0, 0);
    var redChe2 = board.at(8, 9);
    var blackJiang = board.at(4, 0);
    var redJiang = board.at(4, 9);
    expect(blackChe1.getFace()).toEqual(bq.Chesspiece.Face.CHE);
    expect(blackChe1.getColor()).toEqual(bq.Chesspiece.Color.BLACK);
    expect(redChe2.getFace()).toEqual(bq.Chesspiece.Face.CHE);
    expect(redChe2.getColor()).toEqual(bq.Chesspiece.Color.RED);
    expect(blackJiang.getFace()).toEqual(bq.Chesspiece.Face.JIANG);
    expect(blackJiang.getColor()).toEqual(bq.Chesspiece.Color.BLACK);
    expect(redJiang.getFace()).toEqual(bq.Chesspiece.Face.JIANG);
    expect(redJiang.getColor()).toEqual(bq.Chesspiece.Color.RED);
  });
});
