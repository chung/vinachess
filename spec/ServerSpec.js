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
    b.newGame();
  });

  it("should have been initialized correctly when start new game", function() {
    expect(b).started();
  });

  it("should allow white to move first", function() {
    expect(b.turn).toEqual(vnc.Piece.WHITE);
  });

  it("should correctly move pieces", function() {
    b.move('P2-5'); b.move('M2.3');
    b.move('P8.2'); b.move('X1.1');
    b.move('P5/1'); b.move('M3/5');
    expect(b.white.P).toEqual(['b5', 'e8']);
    expect(b.black.M).toEqual(['b5', 'a8']);
    expect(b.black.X).toEqual(['b1', 'a9']);
  });

  it("should correctly move the same piece for black & white", function() {
    b.move('P2-5');
    b.move('P2-5');
    expect(b.white.P).toEqual(['c5', 'c8']);
    expect(b.black.P).toEqual(['c5', 'c8']);
  });

  it("should correctly capture piece", function() {
    b.move('P2.7');
    b.move('P2.7');
    expect(b.white.P).toEqual(['j2', 'c8']);
    expect(b.black.P).toEqual(['j2', 'c8']);
    expect(b.white.M).toEqual(['a2']); // a8 captured
    expect(b.black.M).toEqual(['a2']); // a8 captured
    b.move('X9-8');
    expect(b.black.P).toEqual(['c8']); // j2 captured
    b.move('X9-8');
    expect(b.white.P).toEqual(['c8']); // j2 captured
  });

});
