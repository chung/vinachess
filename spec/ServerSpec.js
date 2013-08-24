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
    b = new vnc.Server('chung', 'son').board('son');
  });

  it("should have been initialized correctly when start new game", function() {
    expect(b).started();
  });

  it("should allow white to move first", function() {
    expect(b.turn).toEqual(vnc.Piece.WHITE);
  });

  it("should correctly move piece", function() {
    b.move('P2-5');
    b.move('M2.3');
    expect(b.white.P).toEqual(['c5', 'c8']);
    expect(b.black.M).toEqual(['c3', 'a8']);
  });

  it("should correctly move the same piece for black & white", function() {
    b.move('P2-5');
    b.move('P2-5');
    expect(b.white.P).toEqual(['c5', 'c8']);
    expect(b.black.P).toEqual(['c5', 'c8']);
  });
});
