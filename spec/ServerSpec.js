describe("Chess server", function() {
  var server;
  beforeEach(function() {
    server = new vnc.Server();
  });

  it("should have a board initialized", function() {
    expect(server.board).toNotEqual(undefined);
  });

});
