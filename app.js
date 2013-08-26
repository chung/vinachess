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

var broadcast = function(board) {
    io.sockets.emit("game", { html: board.toHtml(), users: server.users, board: board });
}

// socket.io
io.sockets.on('connection', function (socket) {
    var user = addUser(socket.handshake.address.address);
    socket.emit("welcome", user);
    server.join(user.name);
    if (server.boards[0]) {
        console.log('\n\n\nstarting new game:\n\n\n');
        broadcast(server.boards[0]);
    }
    socket.on('disconnect', function() {
        removeUser(user);
        server.unjoin(user.name);
    });
    socket.on('chat', function(data) {
        var m1 = "<strong>" + data.username + "</strong>", m2 = data.username;
        socket.emit("updateChat", { message: m1 + ': ' + data.message });
        socket.broadcast.emit("updateChat", { message: m2 + ': ' + data.message });
    });
    socket.on('send', function(data) {
        console.log(data);
        if (server.boards[0]) {
            server.boards[0].move(data.message);
            broadcast(server.boards[0]);
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
    var str = '';
    for(var i=0; i<users.length; i++) {
        var user = users[i];
        str += user.name + ' <small>(' + user.ip + ')</small><br />';
    }
    io.sockets.emit("users", { users: str });
}

