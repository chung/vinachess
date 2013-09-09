describe("Chess server", function() {
  var s;
  beforeEach(function() {
    s = new vnc.Server();
  });

  it("should have no user initially", function() {
    expect(s.users.length).toEqual(0);
  });

  it("should start a new game in public room if user join without a private room", function() {
    s.join('chung');
    s.join('son');
    var b = s.board();
    expect(s.users.length).toEqual(2);
    expect(b).started();
  });

  it("should be able to unjoin users", function() {
    expect(s.users.length).toEqual(0);
    s.join('chung');
    s.join('son');
    expect(s.users.length).toEqual(2);
    s.unjoin('chung');
    expect(s.users.length).toEqual(1);
    expect(s.users[0]).toEqual('son');
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
    expect(b.paths.length).toEqual(1);
    expect(b.paths[0].length).toEqual(1);
  });

  it("should allow white to move first", function() {
    expect(b.turn).toEqual(vnc.Piece.WHITE);
  });

  it("should correctly move pieces", function() {
    b.move('Tg5.1'); b.move('Tg5.1');
    b.move('P2-5'); b.move('M2.3');
    b.move('P8.2'); b.move('X1.1');
    b.move('P5/1'); b.move('M3/5');
    expect(b.white.Tg).toEqual(['b5']);
    expect(b.black.Tg).toEqual(['b5']);
    expect(b.white.P).toEqual(['b5', 'e8']);
    expect(b.black.M).toEqual(['a8', 'b5']);
    expect(b.black.X).toEqual(['b1', 'a9']);
  });

  it("should be able to create new path", function() {
    b.move('P2-5'); b.move('M2.3');
    b.move('P8.2'); b.move('X1.1');
    b.move('Tg5.1'); b.move('Tg5.1');
    b.undo(); b.undo();
    b.move('P5/1');
    expect(b.paths.length).toEqual(2);
    expect(b.path).toEqual(0); // this.path remain at 0
    expect(b.paths[0].length).toEqual(6); // main line
    expect(b.paths[1].length).toEqual(7); // old line
  });

  it("should be able to switch path", function() {
    b.move('P2-5'); b.move('M2.3');
    b.move('P8.2'); b.move('X1.1');
    b.move('Tg5.1'); b.move('Tg5.1');
    b.undo(); b.undo();
    b.move('P5/1');
    expect(b.paths.length).toEqual(2);
    expect(b.paths[0].length).toEqual(6); // main line
    expect(b.paths[1].length).toEqual(7); // old line
    expect(b.white.Tg).toEqual(['a5']);
    expect(b.black.Tg).toEqual(['a5']);
    b.select(6, 1);
    expect(b.path).toEqual(1);
    expect(b.white.Tg).toEqual(['b5']);
    expect(b.black.Tg).toEqual(['b5']);
  });

  it("should correctly move pieces with before/after notation", function() {
    b.newGame({B: ['d3', 'f3', 'g3', 'h3', 'i3']}, {B: ['d3', 'f3', 'g3', 'h3', 'i3']});
    expect(b.getMove('B1', 'e7', 'e8')).toEqual('Btsss3-2');
    expect(b.getMove('B1', 'g7', 'f7')).toEqual('Bssss3.1');
    expect(b.getMove('B0', 'i3', 'j3')).toEqual('Btttt3.1');
    expect(b.getMove('B0', 'h3', 'h4')).toEqual('Bttts3-4');
    expect(b.getMove('B0', 'g3', 'g4')).toEqual('Bttss3-4');
    expect(b.getMove('B0', 'f3', 'f4')).toEqual('Btsss3-4');
    expect(b.getMove('B0', 'd3', 'e3')).toEqual('Bssss3.1');
    b.move('Bttss3-2');
    expect(b.white.B).toEqual(['d3', 'f3', 'g2', 'h3', 'i3']);
    b.move('Bttts3-2');
    expect(b.black.B).toEqual(['d3', 'f3', 'g3', 'h2', 'i3']);
    b.move('Bt3.1'); // same as Btttt3.2
    expect(b.white.B).toEqual(['d3', 'f3', 'g2', 'h3', 'j3']);
    b.move('Bs3.1'); // same as Bssss3.1
    expect(b.black.B).toEqual(['e3', 'f3', 'g3', 'h2', 'i3']);
  });

  it("should correctly move the same piece for black & white", function() {
    b.move('P2-5');
    b.move('P2-5');
    expect(b.white.P).toEqual(['c5', 'c8']);
    expect(b.black.P).toEqual(['c5', 'c8']);
  });

  it("should correctly capture piece", function() {
    b.move('P2.7');
    expect(b.white.P).toEqual(['j2', 'c8']);
    expect(b.black.M).toEqual(['a2']); // a8 captured
    expect(b.grid[0][7]).toEqual('P1'); // white P
    b.move('P2.7');
    expect(b.black.P).toEqual(['j2', 'c8']);
    expect(b.white.M).toEqual(['a2']); // a8 captured
    b.move('X9-8');
    expect(b.black.P).toEqual(['c8']); // j2 captured
    b.move('X9-8');
    expect(b.white.P).toEqual(['c8']); // j2 captured
  });

  it("should correctly get move for black & white from position based to VN recording format", function() {
    expect(b.getMove('P1', 'h8', 'h7')).toEqual('P2-3');
    expect(b.getMove('P1', 'h2', 'a2')).toEqual('P8.7');
    expect(b.getMove('P0', 'c2', 'c7')).toEqual('P2-7');
    expect(b.getMove('P0', 'c2', 'd5')).toBeNull(); // illegal move
    expect(b.getMove('P0', 'c2', 'a2')).toBeNull(); // illegal move
    expect(b.getMove('B1', 'g9', 'f9')).toEqual('B1.1');
    expect(b.getMove('B0', 'd3', 'e3')).toEqual('B3.1');
    expect(b.getMove('B0', 'd5', 'c5')).toBeNull(); // illegal move
    expect(b.getMove('Tg1', 'j5', 'i5')).toEqual('Tg5.1');
    expect(b.getMove('Tg1', 'j5', 'j6')).toBeNull();
    expect(b.getMove('Tg0', 'a5', 'b5')).toEqual('Tg5.1');
    expect(b.getMove('Tg0', 'a5', 'b6')).toBeNull();
    expect(b.getMove('S0', 'a4', 'b5')).toEqual('S4.5');
    expect(b.getMove('S1', 'j4', 'i5')).toEqual('S6.5');
    expect(b.getMove('S0', 'a4', 'b4')).toBeNull();
    expect(b.getMove('M1', 'j8', 'h9')).toEqual('M2.1');
    expect(b.getMove('M1', 'j8', 'i6')).toBeNull();
    expect(b.getMove('M0', 'a2', 'c3')).toEqual('M2.3');
    expect(b.getMove('X1', 'j9', 'h9')).toEqual('X1.2');
  });

  it("should be able to undo", function() {
    expect(b.grid[7][7]).toEqual('P1');
    b.move('P2-5');
    expect(b.grid[7][7]).toBeNull();
    expect(b.turn).toEqual(vnc.Piece.BLACK);
    b.undo();
    expect(b.turn).toEqual(vnc.Piece.WHITE);
    expect(b.grid[7][7]).toEqual('P1');
  });

  it("should be able to undo twice", function() {
    b.move('P2-5');
    b.undo();
    b.move('M2.3');
    b.undo();
    expect(b.grid[7][7]).toEqual('P1');
    expect(b.grid[9][7]).toEqual('M1');
  });

  it("should be able to redo", function() {
    expect(b.grid[7][7]).toEqual('P1');
    b.move('P2-5');
    b.undo();
    expect(b.turn).toEqual(vnc.Piece.WHITE);
    expect(b.grid[7][7]).toEqual('P1');
    b.redo();
    expect(b.turn).toEqual(vnc.Piece.BLACK);
    expect(b.grid[7][7]).toBeNull();
    expect(b.grid[7][4]).toEqual('P1');
  });

  it("should be able to clear the undo history after making new move", function() {
    b.move('P2-5');
    b.move('P8-5');
    expect(b.grid[2][7]).toBeNull();
    b.undo();
    expect(b.turn).toEqual(vnc.Piece.BLACK);
    expect(b.grid[2][7]).toEqual('P0');
    b.redo();
    expect(b.turn).toEqual(vnc.Piece.WHITE);
    expect(b.grid[2][7]).toBeNull();
    expect(b.grid[2][4]).toEqual('P0');
    b.undo();
    b.undo(); // back to start
    b.move('M2.3'); // make a new move should clear history
    expect(b.turn).toEqual(vnc.Piece.BLACK);
    expect(b.grid[7][6]).toEqual('M1');
    expect(b.grid[2][7]).toEqual('P0');
    expect(b.grid[7][7]).toEqual('P1');
    b.redo(); // so that nothing to redo
    expect(b.turn).toEqual(vnc.Piece.BLACK);
    expect(b.grid[7][6]).toEqual('M1');
    expect(b.grid[2][7]).toEqual('P0');
    expect(b.grid[7][7]).toEqual('P1');
  });
});


describe("vnc.neutralize", function() {
  it("should neutralize simple moves correctly", function() {
    expect(vnc.neutralize('P2-5')).toEqual('P8-5');
    expect(vnc.neutralize('S4.5')).toEqual('S6.5');
    expect(vnc.neutralize('T7/9')).toEqual('T3/1');
    expect(vnc.neutralize('M4.5')).toEqual('M6.5');
    expect(vnc.neutralize('X1-2')).toEqual('X9-8');
  });

  it("should neutralize complex moves correctly", function() {
    expect(vnc.neutralize('1. T3.5 S4.5')).toEqual('1. T7.5 S6.5');
    expect(vnc.neutralize('1. P2-5 M8.7\n2. M2.3 M2.3')).toEqual('1. P8-5 M2.3\n2. M8.7 M8.7');
  });
});


describe("vnc.getRoot", function() {
  it("should get the longest common string correctly", function() {
    expect(vnc.getRoot([])).toBeNull();
    expect(vnc.getRoot(['abc'])).toEqual('abc');
    expect(vnc.getRoot(['abc', 'abd'])).toEqual('ab');
  });

  it("should getRoot correctly for both string & array", function() {
    expect(vnc.getRoot(['ab', 'bc'])).toEqual('');
    expect(vnc.getRoot([['a','b'], ['b','c']])).toEqual([]);
    expect(vnc.getRoot(['ab', 'ac'])).toEqual('a');
    expect(vnc.getRoot([['a','b'], ['a','c']])).toEqual(['a']);
  });
});


describe("vnc.toTree", function() {
  it("should convert to tree json correctly", function() {
    expect(vnc.toTree([])).toEqual({});
    expect(vnc.toTree(['abc'])).toEqual({name: 'abc'});
    expect(vnc.toTree(['abc', 'abd'])).toEqual({name: 'ab', children: [{name: 'c'}, {name: 'd'}]});
    expect(vnc.toTree(['abc', 'abde', 'abdfg'])).toEqual({name: 'ab', children: [{name: 'c'}, {name: 'd', children: [{name: 'e'}, {name: 'fg'}]}]});
    expect(vnc.toTree(['abcd', 'abce', 'abd'])).toEqual({name: 'ab', children: [{name: 'c', children: [{name: 'd'}, {name: 'e'}]}, {name: 'd'}]});
  });

  it("should convert to partial tree correctly", function() {
    expect(vnc.getChildren(['ab', 'bc'])).toEqual([{name: 'ab'}, {name: 'bc'}]);
    expect(vnc.getChildren(['ab', 'ac', 'bd'])).toEqual([{name: 'a', children: [{name: 'b'}, {name: 'c'}]}, {name: 'bd'}]);
    expect(vnc.getChildren(['ab', 'bc', 'bd'])).toEqual([{name: 'ab'}, {name: 'b', children: [{name: 'c'}, {name: 'd'}]}]);
  });

  it("should convert array of array to partial tree correctly", function() {
    expect(vnc.getChildren([['a','b'], ['b','c']])).toEqual([{name: 'a,b'}, {name: 'b,c'}]);
    expect(vnc.getChildren([['a','b'], ['a','c'], ['b','d']])).toEqual([{name: 'a', children: [{name: 'b'}, {name: 'c'}]}, {name: 'b,d'}]);
  });

  it("should convert chess moves to tree json correctly", function() {
    expect(vnc.toTree([['P2-5','M2.1'], ['P2-5','M2.3']]))
      .toEqual({name: 'P2-5', children: [{name: 'M2.1'}, {name: 'M2.3'}]});
    expect(vnc.toTree([['P2-5','M2.1', 'X1-2'], ['P2-5','M2.1', 'X1.1'], ['P2-5','M2.3']]))
      .toEqual({name: 'P2-5', children: [{name: 'M2.1', children: [{name: 'X1-2'}, {name: 'X1.1'}]}, {name: 'M2.3'}]});
  });
});
