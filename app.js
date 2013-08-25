var fs = require('fs');
var express = require('express');
var app = express();
var Moniker = require('moniker');
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/public'));
app.get("/server.js", function(req, res){
  fs.readFile('./src/server.js', function (err, data) {
    if(err) throw err;
    res.writeHead(200);
    res.end(data);
  });
});

var io = require('socket.io').listen(app.listen(port));

console.log("Listening on port " + port);
/*
// need this for heroku
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});
*/

var vnc = require('./src/server.js');
var server = new vnc.Server();
//var board = document.getElementById("board");
//board.innerHTML = server.board('son').move('P2-5').move('P2-5').move('M2.3').move('P5.4').move('M3.5').toHtml();

// socket.io
io.sockets.on('connection', function (socket) {
	var user = addUser();
	updateWidth();
	socket.emit("welcome", user);
    server.join(user.name);
    var b = server.boards[0];
    if (b) {
      console.log('\n\n\nstarting new game:\n\n\n');
      io.sockets.emit("game", {html: b.toHtml(), users: server.users});
    }
	socket.on('disconnect', function() {
		removeUser(user);
        server.unjoin(user.name);
  	});
	socket.on('send', function(data) {
		console.log(data);
        b.move(data.message);
        io.sockets.emit("game", {html: b.toHtml(), users: server.users});
  	});
  	socket.on("click", function() {
  		currentWidth += 1;
  		user.clicks += 1;
  		if(currentWidth == winWidth) {
  			currentWidth = initialWidth;
  			io.sockets.emit("win", { message: "<strong>" + user.name + "</strong> rocks!" });
  		}
  		updateWidth();
  		updateUsers();
  	});
});

// game logic
var initialWidth = 20;
var currentWidth = initialWidth;
var winWidth = 30;
var users = [];

var addUser = function() {
	var user = {
		name: Moniker.choose(),
		clicks: 0
	}
	users.push(user);
	updateUsers();
	return user;
}
var removeUser = function(user) {
	for(var i=0; i<users.length; i++) {
		if(user.name === users[i].name) {
			users.splice(i, 1);
			updateUsers();
			return;
		}
	}
}
var updateUsers = function() {
	var str = '';
	for(var i=0; i<users.length; i++) {
		var user = users[i];
		str += user.name + ' <small>(' + user.clicks + ' clicks)</small><br />';
	}
	io.sockets.emit("users", { users: str });
}
var updateWidth = function() {
	io.sockets.emit("update", { currentWidth: currentWidth });
}