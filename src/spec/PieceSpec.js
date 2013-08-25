describe("Chess piece", function() {
  var board, _ = function(x, y) { return {x: x, y: y, board: board}; };
  beforeEach(function() {
    board = new bq.Chessboard();
    board.render();
    board.newGame();
  });

  it("BING should only move ahead one step at a time before the River", function() {
    expect(_(4, 6)).movable(4, 5);
    expect(_(0, 3)).not.movable(0, 5);
    expect(_(0, 3)).movable(0, 4);
    expect(_(0, 6)).not.movable(0, 4);
    expect(_(0, 6)).not.movable(1, 6);
  });

  it("BING can never move backward", function() {
    expect(_(4, 6)).not.movable(4, 7);
  });

  it("BING can move side way after the River, but still one step at a time", function() {
    expect(_(4, 6)).movable(4, 5);
    expect(_(0, 3)).movable(0, 4);
    expect(_(4, 5)).movable(4, 4);
    expect(_(0, 4)).not.movable(1, 4);
  });

  it("JIANG should only move one step at a time", function() {
    expect(_(4, 9)).movable(4, 8);
    expect(_(4, 0)).not.movable(5, 1);
    expect(_(4, 0)).movable(4, 1);
    expect(_(4, 8)).not.movable(5, 7);
    expect(_(4, 8)).movable(5, 8);
  });

  it("JIANG should only move within the palace", function() {
    expect(_(4, 9)).movable(4, 8);
    expect(_(4, 0)).movable(4, 1);
    expect(_(4, 8)).movable(5, 8);
    expect(_(4, 1)).movable(4, 2);
    expect(_(5, 8)).not.movable(6, 8);
    expect(_(4, 2)).not.movable(4, 3);
  });

  it("MA should only move in L shape", function() {
    expect(_(1, 9)).movable(0, 7);
    expect(_(1, 0)).movable(2, 2);
    expect(_(0, 7)).movable(1, 9);
    expect(_(2, 2)).movable(1, 0);
    expect(_(1, 9)).not.movable(2, 8);
    expect(_(1, 0)).not.movable(3, 2);
  });

  it("MA cannot move if blocked", function() {
    expect(_(1, 9)).not.movable(3, 8);
    expect(_(1, 9)).movable(2, 7);
    expect(_(1, 0)).not.movable(3, 1);
    expect(_(1, 0)).movable(0, 2);
    expect(_(2, 7)).not.movable(0, 8);
  });

  it("XIANG should only move in big diagonal", function() {
    expect(_(2, 9)).movable(4, 7);
    expect(_(2, 0)).movable(4, 2);
    expect(_(4, 7)).movable(2, 5);
    expect(_(4, 2)).movable(2, 0);
    expect(_(6, 9)).not.movable(8, 8);
    expect(_(2, 0)).not.movable(3, 2);
  });

  it("XIANG cannot move if blocked", function() {
    expect(_(2, 9)).movable(4, 7);
    expect(_(2, 0)).movable(4, 2);
    expect(_(1, 9)).movable(3, 8); // MA blocks
    expect(_(1, 0)).movable(3, 1);
    expect(_(4, 7)).not.movable(2, 9); // blocked by MA
    expect(_(4, 7)).not.movable(6, 9); // the other XIANG there
    expect(_(4, 7)).movable(6, 5); // legal move
    expect(_(4, 2)).not.movable(2, 0);
  });

  it("XIANG cannot move across the River", function() {
    expect(_(2, 9)).movable(4, 7);
    expect(_(2, 0)).movable(4, 2);
    expect(_(4, 7)).movable(6, 5); // at the River
    expect(_(4, 2)).movable(2, 4);
    expect(_(6, 5)).not.movable(4, 3); // blocked by River
    expect(_(6, 5)).movable(4, 7);
    expect(_(2, 4)).not.movable(0, 6);
  });

  it("SHI should only move in small diagonal & inside the Palace", function() {
    expect(_(3, 9)).movable(4, 8);
    expect(_(3, 0)).movable(4, 1);
    expect(_(4, 8)).movable(3, 7);
    expect(_(4, 1)).movable(5, 2);
    expect(_(3, 7)).not.movable(2, 8);
    expect(_(5, 2)).not.movable(3, 2);
  });

  it("CHE can move in straight line if no other piece blocking", function() {
    expect(_(0, 9)).not.movable(0, 5);
    expect(_(0, 9)).movable(0, 7);
    expect(_(0, 0)).movable(0, 1);
    expect(_(0, 7)).not.movable(3, 7); // blocked by PAO
    expect(_(0, 7)).not.movable(1, 8); // no diagonal move
    expect(_(0, 7)).movable(0, 8); // ok to back off
    expect(_(0, 1)).movable(5, 1); // ok to move long distance
    expect(_(0, 8)).movable(8, 8); // even longer distance
    expect(_(5, 1)).movable(5, 9); // can capture the SHI across the River
  });

  it("PAO move like CHE but jump over exactly 1 piece to capture", function() {
    expect(_(1, 7)).not.movable(1, 2); // cannot capture since no piece in between
    expect(_(1, 7)).movable(1, 0); // but can capture here
    expect(_(1, 2)).not.movable(1, 9); // no longer legal move
    expect(_(1, 2)).movable(1, 8); // but ok here
    expect(_(1, 0)).not.movable(4, 0); // 2 pieces in between: no good
    expect(_(1, 0)).movable(3, 0); // 1 piece in between: good
  });
});