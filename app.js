var fs = require('fs');
var express = require('express');
var app = express();
var Moniker = require('moniker');
var elastical = require('elastical');
var vnc = require('./src/server.js');
var port = process.env.PORT || 5000;
var client = new elastical.Client('localhost');
var server = new vnc.Server();

// trying to restore the latest server
client.get('vinachess', 'latest', function (err, doc, res) {
    if (err) console.log(err);
    else {
        server = new vnc.Server(doc);
        console.log('\n\n*** Server restored successfully from previous state ***\n\n');
    }
});

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

setTimeout(function() { io.sockets.emit('restart') }, 5000);

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
        socket.emit("board", board);
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
        try {
            vnc.Board.prototype.move.call(board, data.message);
            socket.broadcast.to(room).emit("board", board);
            client.index('vinachess', 'server', {boards: server.boards}, {id: 'latest', create: false}, function (err, res) {
                if (err) console.log(err);
                else console.log(res);
            });
        } catch (e) {
            console.log(e);
            socket.disconnect();
            updateUsers();
        }
    });
    socket.on('undo', function() {
        try {
            io.sockets.in(room).emit("board", vnc.Board.prototype.undo.call(board));
        } catch (e) {
            console.log(e);
            socket.disconnect();
            updateUsers();
        }
    });
    socket.on('redo', function() {
        try {
            io.sockets.in(room).emit("board", vnc.Board.prototype.redo.call(board));
        } catch (e) {
            console.log(e);
            socket.disconnect();
            updateUsers();
        }
    });
    socket.on('new', function() {
        try {
            io.sockets.in(room).emit("board", vnc.Board.prototype.newGame.call(board));
        } catch (e) {
            console.log(e);
            socket.disconnect();
            updateUsers();
        }
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
    io.sockets.emit("users", { users: users, count: users.length });
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
