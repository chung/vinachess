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
    var b = s.board('chung');
    expect(s.users.length).toEqual(2);
    expect(b).started();
    expect(b.wplayer).toEqual('chung');
    expect(b.bplayer).toEqual('son');
  });
});


describe("Chess board", function() {
  var b;
  beforeEach(function() {
    b = new vnc.Board();
  });

  it("should have been initialized correctly when start new game", function() {
    b.newGame();
    expect(b).started();
  });

  it("should alternate side if start new game again", function() {
    b.newGame();
    expect(b.turn).toEqual(vnc.Piece.WHITE);
    b.newGame();
    expect(b.turn).toEqual(vnc.Piece.BLACK);
  });
});
