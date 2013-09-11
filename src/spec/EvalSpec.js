describe("Chess count", function() {
  var b;
  beforeEach(function() {
    b = new vnc.Board();
    b.newGame();
  });

  it("should be 32 initially", function() {
    expect(vnc.count(b)).toEqual(32);
    expect(vnc.count(b, 0)).toEqual(16);
    expect(vnc.count(b, 1)).toEqual(16);
  });

  it("in TP should increase value for white after P2-5 P8-5 P5.4 but not after black arrange 2 M", function() {
    b.move('P2-5', 'P8-5');
    b.move('P5.4', 'S4.5');
    expect(vnc.count(b)).toEqual(31);
    expect(vnc.count(b, 0)).toEqual(15);
    expect(vnc.count(b, 1)).toEqual(16);
    b.move('P8-5', 'M2.3');
    b.move('M2.3', 'M3.5');
    expect(vnc.count(b)).toEqual(30);
    expect(vnc.count(b, 0)).toEqual(15);
    expect(vnc.count(b, 1)).toEqual(15);
    b.move('P5.4', 'M8.7');
    expect(vnc.count(b)).toEqual(29);
    expect(vnc.count(b, 0)).toEqual(14);
    expect(vnc.count(b, 1)).toEqual(15);
  });

});


describe("Chess score", function() {
  var b;
  beforeEach(function() {
    b = new vnc.Board();
    b.newGame();
  });

  it("should be zero initially", function() {
    expect(vnc.eval(b)).toEqual(0);
    expect(vnc.eval(b, 0)).toEqual(15590);
    expect(vnc.eval(b, 1)).toEqual(15590);
  });

  it("should increase value for white after P2-5", function() {
    expect(vnc.eval(b.move('P2-5'))).toEqual(50);
  });

  it("should equal value after P2-5 P8-5", function() {
    expect(vnc.eval(b.move('P2-5', 'P8-5'))).toEqual(0);
  });

  it("in TP should increase value for white after P2-5 P8-5 P5.4 but not after black arrange 2 M", function() {
    expect(vnc.eval(b.move('P2-5', 'P8-5'))).toEqual(0);
    expect(vnc.eval(b.move('P5.4', 'S4.5'))).toEqual(120);
    expect(vnc.eval(b.move('M2.3', 'M2.3'))).toEqual(120);
    expect(vnc.eval(b.move('P5/1', 'M8.7'))).toEqual(30);
  });

  it("in TP should decrease value for white after exchanging & black move M", function() {
    expect(vnc.eval(b.move('P2-5', 'P8-5', 'P5.4', 'S4.5', 'M2.3', 'M2.3'))).toEqual(120);
    expect(vnc.eval(b.move('P8-5', 'M3.5', 'P5.4'))).toEqual(-50);
    expect(vnc.eval(b.move('M8.7', 'P5/1'))).toEqual(-140);
  });

  it("in BPM: white slightly better after move X across river to attack B7 & black offer to exchange X", function() {
    expect(vnc.eval(b.move('P2-5', 'M8.7', 'M2.3', 'M2.3'))).toEqual(-40);
    expect(vnc.eval(b.move('X1-2', 'X9.8'))).toEqual(-40);
    expect(vnc.eval(b.move('X2.6', 'P8-9'))).toEqual(20);
    expect(vnc.eval(b.move('X2-3', 'P9/1'))).toEqual(110);
  });
});

describe("vnc.getMoves", function() {
  var b;
  beforeEach(function() {
    b = new vnc.Board();
    b.newGame();
  });

  it("should return correct legal moves", function() {
    expect(vnc.getMoves(b, 'X', 'a1')).toEqual([ 'X1.1', 'X1.2' ]);
    expect(vnc.getMoves(b, 'B', 'd5')).toEqual([ 'B5.1' ]);
    expect(vnc.getMoves(b, 'Tg', 'a5')).toEqual([ 'Tg5.1' ]);
    expect(vnc.getMoves(b, 'P', 'c2')).toEqual([ 'P2/1', 'P2.1', 'P2.2', 'P2.3', 'P2.4', 'P2.7', 'P2-1', 'P2-3', 'P2-4', 'P2-5', 'P2-6', 'P2-7' ]);
    expect(vnc.getMoves(b, 'P', 'c8')).toEqual([ 'P8/1', 'P8.1', 'P8.2', 'P8.3', 'P8.4', 'P8.7', 'P8-3', 'P8-4', 'P8-5', 'P8-6', 'P8-7', 'P8-9' ]);
    expect(vnc.getMoves(b, 'M', 'a2')).toEqual([ 'M2.3', 'M2.1' ]);
    expect(vnc.getMoves(b, 'T', 'a3')).toEqual([ 'T3.5', 'T3.1' ]);
    expect(vnc.getMoves(b, 'S', 'a6')).toEqual([ 'S6.5' ]);
    expect(vnc.allMoves(b).length).toEqual(44);
    b.move('P2-5', 'P8-5', 'M2.3', 'M8.7', 'X1-2', 'X1.1', 'X2.4', 'X9-4');
    expect(vnc.getMoves(b, 'X', 'e2').length).toEqual(17);
    expect(vnc.getMoves(b, 'X', 'a9').length).toEqual(2);
    expect(vnc.allMoves(b, 'X').length).toEqual(19);
    expect(vnc.allMoves(b).length).toEqual(48);
  });

  it("should return correct legal moves for X", function() {
    b.move('P2-5', 'P8-5', 'M2.3', 'M8.7', 'X1-2', 'X1.1', 'X2.3', 'X9-4');
    expect(vnc.allMoves(b, 'X').length).toEqual(11);
    expect(vnc.allMoves(b).length).toEqual(40);
  });
});

xdescribe("vnc.next", function() {
  var b;
  beforeEach(function() {
    b = new vnc.Board();
    b.newGame();
  });

  it("should show P2-5 as next move", function() {
    b.move('T3.5', 'M8.7');
    expect(vnc.next(b)).toEqual({});
  });
});