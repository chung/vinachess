describe("Chess server", function() {
  var s;
  beforeEach(function() {
    s = new vnc.Server();
  });

  it("should have no user initially", function() {
    expect(s.users.length).toEqual(0);
  });

  it("should start a new game if there are 2 users", function() {
    s.join('chung');
    s.join('son');
    expect(s.users.length).toEqual(2);
    expect(s.board.white).toEqual(vnc.Piece.START);
    expect(s.board.black).toEqual(vnc.Piece.START);
    expect(s.board.turn).toEqual(vnc.Piece.WHITE);
  });
});


describe("Chess board", function() {
  var b;
  beforeEach(function() {
    var server = new vnc.Server();
    b = server.board;
  });

  it("should have been initialized correctly when start new game", function() {
    b.newGame();
    expect(b.white).toEqual(vnc.Piece.START);
    expect(b.black).toEqual(vnc.Piece.START);
    expect(b.turn).toEqual(vnc.Piece.WHITE);
  });

  it("should alternate side if start new game again", function() {
    b.newGame();
    expect(b.turn).toEqual(vnc.Piece.WHITE);
    b.newGame();
    expect(b.turn).toEqual(vnc.Piece.BLACK);
  });
});
