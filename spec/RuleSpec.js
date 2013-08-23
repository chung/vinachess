describe("Chess rule", function() {
  var board, _ = function(x, y) { return {x: x, y: y, board: board}; };
  beforeEach(function() {
    board = new bq.Chessboard();
    board.render();
    board.newGame();
  });

  it("should allow Red to move first", function() {
    expect(_(4, 6)).movable(4, 5); // red Bing
  });

  it("should not allow Black to move first", function() {
    expect(_(0, 3)).not.movable(0, 4); // black Bing
  });

  it("should not allow Red to make 2 moves consecutively", function() {
    expect(_(4, 6)).movable(4, 5); // red Bing move first
    expect(_(4, 5)).not.movable(4, 4); // red Bing can not move gain
  });

  it("should not allow a move that result in the JIANG be captured in the next move", function() {
    expect(_(1, 7)).movable(1, 0);
    expect(_(3, 0)).not.movable(4, 1); // illegal move since PAO threaten to capture the JIANG
  });

  it("should not allow a move that result in 2 JIANGs be directly facing each other", function() {
    expect(_(4, 6)).movable(4, 5);
    expect(_(4, 3)).movable(4, 4);
    expect(_(4, 5)).movable(4, 4);
    expect(_(2, 0)).movable(0, 2);
    expect(_(4, 4)).not.movable(3, 4); // illegal move since 2 JIANGs will be facing each other
    
    expect(_(1, 7)).movable(1, 0); // check
    expect(_(4, 0)).movable(4, 1);
    expect(_(4, 4)).movable(4, 3);
    expect(_(4, 1)).not.movable(4, 0); // can not move back since PAO is threatening
  });
});
