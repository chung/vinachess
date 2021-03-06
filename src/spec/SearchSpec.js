describe("Chess board", function() {
  var b;
  beforeEach(function() {
    b = score.Board;
  });

  it("should format move to VN style correctly", function() {
    expect(search.formatMove(b, [70, 62])).toEqual('M2.3');
    expect(search.formatMove(b, [72, 42])).toEqual('P2-5');
    expect(search.formatMove(b, [12, 42])).toEqual('P8-5');
    expect(search.formatMove(b, [17, 47])).toEqual('P2-5');
    expect(search.formatMove(b, [77, 47])).toEqual('P8-5');
    var board = new vnc.Board(); board.newGame();
    expect(search.format(board, [[70, 62], [72, 42]])).toEqual(['M2.3', 'P2-5']);
  });

  it("score should be zero initially", function() {
    expect(search.evaluate(b)).toEqual(0);
    b = [
    6, 0, 0, 1, 0, 0,-1, 0, 0, -6,
    4, 0, 5, 0, 0, 0, 0,-5, 0, -4,
    3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
    2, 0, 0, 0, 0, 0, 0, 0, 0, -2,
    7, 0, 0, 1, 0, 0,-1, 0, -7, 0,
    2, 0, 0, 0, 0, 0, 0, 0, 0, -2,
    3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
    4, 0, 5, 0, 0, 0, 0,-5, 0, -4,
    6, 0, 0, 1, 0, 0,-1, 0, 0, -6];
    expect(search.evaluate(b)).toEqual(130);
 });

  it("score.middle should return the blocking piece for M", function() {
    expect(score.middle(2,10)).toEqual(1);
    expect(score.middle(10,2)).toEqual(11);
    expect(score.middle(38,59)).toEqual(48);
    expect(score.middle(38,57)).toEqual(48);
  });

  it("genMoves should get correct legal move position", function() {
    //console.log(search.genAllMoves(b, 1));
    expect(search.genMoves(b, 40).sort()).toEqual([41]);
    expect(search.genMoves(b, 10).sort()).toEqual([2,22]);
    expect(search.genMoves(b, 0).sort()).toEqual([1,2]);
    expect(search.genMoves(b, 9).sort()).toEqual([7,8]);
    expect(search.genMoves(b, 20).sort()).toEqual([2,42]);
    expect(search.genMoves(b, 40).sort()).toEqual([41]);
    expect(search.genMoves(b, 43).sort()).toEqual([44]);
    expect(search.genMoves(b, 49).sort()).toEqual([48]);
    expect(search.genMoves(b, 30).sort()).toEqual([41]);
    expect(search.genMoves(b, 17).sort()).toEqual([ 10, 13, 14, 15, 16, 18, 27, 37, 47, 57, 67, 7 ]);
    b = [
    0, 6, 0, 1,-1, 0, 0, 0, 0, -6,
    4, 0, 5, 0, 0, 0, 0,-5, 0, -4,
    3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
    2, 0, 0, 0, 0, 0, 0, 0, 4, -2,
    7, 0, 0, 1, 0, 0,-1, 0, -7, 0,
    2, 0, 0, 0, 0, 0, 0, 0, 0, -2,
    3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
    0, 0, 5, 0, 0, 0, 0,-5, 0, -4,
    6, 0, 0, 1, 0, 0,-1, 0, 0, -6];
    expect(search.genMoves(b, 4).sort()).toEqual([14,3]);
    expect(search.genMoves(b, 38).sort()).toEqual([ 17, 19, 26, 46 ]);
    expect(search.genMoves(b, 39).sort()).toEqual([]);
    expect(search.genMoves(b, 29).sort()).toEqual([7]);
    expect(search.genMoves(b, 48).sort()).toEqual([ 38, 47, 49, 58 ]);
    expect(search.genMoves(b, 1).sort()).toEqual([0,11,2,21,31,41,51,61,71,81]);
    expect(search.genMoves(b, 12).sort()).toEqual([ 11, 13, 14, 15, 16, 19, 2, 22, 32, 42, 52, 62 ]);
    b = [
    6, 0, 0, 1, 0, 0,-1, 0, 0, -6,
    4, 0, 5, 0, 0, 0, 0,-5, 0, -4,
    3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
    2, 0, 0, 0, 0, 0, 0, 0, 0, -2,
    7, 0, 0, 1, 0,-1, 0, 0, 0, -7,
    2, 0, 0, 0, 0, 0, 0, 0, 0, -2,
    3,-4, 0, 1, 0, 0,-1, 0, 0, -3,
    4, 0, 5, 0, 0, 0, 0,-5, 0,  0,
    6, 0, 0, 1, 0, 0,-1, 0, 0, -6];
    expect(JSON.stringify(search.genAllMoves(b, 1)).indexOf('[40,41]')).toNotEqual(-1);
  });

  it("genAllMoves should return all correct legal move position", function() {
    expect(search.genAllMoves(b, -1).length).toEqual(44);
    expect(search.genAllMoves(b, 1).length).toEqual(44);
  });

  it("search.convert should convert from traditional board to grid successfully", function() {
    var board = new vnc.Board(); board.newGame();
    expect(search.convert(board)).toEqual(b);
  });

  it("search.alphabeta should return the best move", function() {
    b = [
    0, 6, 0, 1,-1, 0, 0, 0, 0, -6,
    4, 0, 5, 0, 0, 0, 0,-5, 0, -4,
    3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
    2, 0, 0, 0, 0, 0, 0, 0, 4, -2,
    7, 0, 0, 1, 0, 0,-1, 0, -7, 0,
    2, 0, 0, 0, 0, 0, 0, 0, 0, -2,
    3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
    0, 0, 5, 0, 0, 0, 0,-5, 0, -4,
    6, 0, 0, 1, 0, 0,-1, 0, 0, -6];
    expect(search.evaluate(b)).toEqual(290);
    //expect(search.mtdf(b, 2, 290, 1)).toEqual({ value : 800, move : [ [ 38, 17 ] ] });
    //expect(search.abmem(b, 4, -790, 620, 1)).toEqual(660);
    b = [
    0, 6, 0, 1,-1, 0, 0, 0, 0, -6,
    4, 0, 5, 0, 0, 0, 0, 4, 0, -4,
    3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
    2, 0, 0, 0, 0, 0, 0, 0, 0, -2,
    7, 0, 0, 1, 0, 0,-1, 0, -7, 0,
    2, 0, 0, 0, 0, 0, 0, 0, 0, -2,
    3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
    0, 0, 5, 0, 0, 0, 0,-5, 0, -4,
    6, 0, 0, 1, 0, 0,-1, 0, 0, -6];
    expect(search.evaluate(b)).toEqual(800);
    expect(search.alphabeta(b, 4, -100000, 100000, -1)).toEqual({ value : 1060, move : [ [ 9, 7 ], [ 17, 29 ], [ 79, 67 ], [ 3, 4 ] ] });
    expect(search.negamax(b, 4, -100000, 100000, -1)).toEqual({ value : -1060, move : [ [ 9, 7 ], [ 17, 29 ], [ 79, 67 ], [ 3, 4 ] ] });
  });
});


xdescribe("search.psv", function() {
  var b;
  beforeEach(function() {
    b = [
    0, 6, 0, 1,-1, 0, 0, 0, 0, -6,
    4, 0, 5, 0, 0, 0, 0, 4, 0, -4,
    3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
    2, 0, 0, 0, 0, 0, 0, 0, 0, -2,
    7, 0, 0, 1, 0, 0,-1, 0, -7, 0,
    2, 0, 0, 0, 0, 0, 0, 0, 0, -2,
    3, 0, 0, 1, 0, 0,-1, 0, 0, -3,
    0, 0, 5, 0, 0, 0, 0,-5, 0, -4,
    6, 0, 0, 1, 0, 0,-1, 0, 0, -6];
  });


  it("should return the best move", function() {
    //expect(search.psv(b, 4, -100000, 100000, -1)).toEqual({ value : -1060, move : [ [ 9, 7 ], [ 17, 29 ], [ 79, 67 ], [ 3, 4 ] ], color : -1, depth : 4 });
    //expect(search.psv(b, 5, -100000, 100000, -1)).toEqual({ value : -670, move : [ [ 9, 7 ], [ 17, 29 ], [ 7, 27 ], [ 3, 4 ], [ 27, 29 ] ], color : -1, depth : 5 });
    expect(search.psv(b, 8, -20000, 20000, -1, false, [[ 9, 7 ]])).toEqual({ value : -980, move : [ [ 9, 7 ], [ 17, 29 ], [ 7, 27 ], [ 72, 42 ], [ 27, 29 ], [ 80, 70 ], [ 77, 47 ], [ 70, 79 ] ], color : -1, depth : 8 });
    //expect(search.abmem(b, 6, 1060, 1061, -1)).toEqual(1060);
  });

  xit("should return the best move 2", function() {
    search.move(b, [ [ 9, 7 ], [ 17, 29 ] ]);
    expect(search.psv(b, 4, -100000, 100000, -1)).toEqual({ value : -1050, move : [ [ 7, 57 ], [ 1, 31 ], [ 79, 67 ], [ 31, 39 ] ] });
  });

  xit("should return the correct value", function() {
    search.move(b, [ [ 9, 7 ], [ 17, 29 ], [ 7, 27 ], [ 3, 4 ], [ 27, 29 ] ]);
    expect(search.evaluate(b)).toEqual(670);
  });

  xit("should return the correct value 1", function() {
    search.move(b, [ [ 9, 7 ], [ 17, 29 ], [ 7, 27 ], [ 3, 4 ], [ 27, 29 ], [ 72, 79 ] ]);
    expect(search.evaluate(b)).toEqual(1080);
  });

  xit("should return the correct value 2", function() {
    search.move(b, [ [ 9, 7 ], [ 17, 29 ], [ 7, 27 ], [ 1, 51 ], [ 27, 29 ], [ 51, 59 ] ]);
    expect(search.evaluate(b)).toEqual(800);
  });

  xit("should return the correct value 3", function() {
    search.move(b, [ [ 9, 7 ], [ 17, 29 ], [ 7, 57 ], [ 1, 31 ], [ 79, 67 ], [ 31, 39 ] ]);
    expect(search.evaluate(b)).toEqual(1050);
  });
});
