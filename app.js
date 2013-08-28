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

// need this for heroku
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});


var vnc = require('./src/server.js');
var server = new vnc.Server();


// socket.io
io.sockets.on('connection', function (socket) {
    var user = addUser(socket.handshake.address.address);
    var board, room;
    socket.emit("welcome", user);

    socket.on('join', function(data) {
        room = data.room;
        socket.join(room);
        user.room = room;
        updateUsers();
        server.join(user.name, room);
        board = server.boards[room];
        io.sockets.in(room).emit("board", board);
    });
    socket.on('disconnect', function() {
        removeUser(user);
        server.unjoin(user.name);
    });
    socket.on('chat', function(data) {
        var m1 = '<strong>' + data.username + ': <em>' + data.message + '</em></strong>';
        var m2 = data.username + ': ' + data.message;
        socket.emit("updateChat", { message: m1 });
        socket.broadcast.to(room).emit("updateChat", { message: m2 });
    });
    socket.on('send', function(data) {
        board.move(data.message);
        socket.broadcast.to(room).emit("board", board);
    });
    socket.on('undo', function() {
        io.sockets.in(room).emit("board", board.undo());
    });
    socket.on('redo', function() {
        io.sockets.in(room).emit("board", board.redo());
    });
    socket.on('new', function() {
        io.sockets.in(room).emit("board", board.newGame());
    });
});

var users = [];

var addUser = function(address) {
    var user = {
        name: Moniker.choose(),
        ip: address
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
        str += user.name + ' <small>(' + user.room + ')</small><br />';
    }
    io.sockets.emit("users", { users: str, count: users.length });
}
var findUser = function(username) {
    for(var i=0; i<users.length; i++) {
        if(username === users[i].name) {
            return users[i];
        }
    }
}

app.get("/room/:id", function(req, res){
  res.end('welcome to room: ' + req.params.id + '. your ip is ' + req.ip);
});
