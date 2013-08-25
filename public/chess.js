$(document).ready(function() {
    $("#field").keyup(function(e) {
        if(e.keyCode == 13) {
            sendMessage();
        }
    });
});

var handleClick = function(pos, type) {
  console.log(type, pos);
};

window.onload = function() {
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");

    var welcome = document.getElementById("welcome");
    var allUsers = document.getElementById("users");
    var progress = document.getElementById("progress");
    var results = document.getElementById("results");
    var board = document.getElementById("board");
    var user;

    var socket = io.connect('http://localhost:5000');
    socket.on('welcome', function (data) {
        user = data.name;
        welcome.innerHTML = "Welcome to the game <strong>" + data.name + "</strong>";
    });
    socket.on('users', function (data) {
        allUsers.innerHTML = "<strong>Users:</strong><br />" + data.users;
    });
    socket.on('update', function (data) {
        progress.innerHTML = data.currentWidth;
        progress.style.width = parseInt(data.currentWidth) + "px";
    });
    socket.on('win', function (data) {
        results.innerHTML = data.message;
    });

    progress.onclick = function() {
        socket.emit("click");
    }
    socket.on('game', function (data) {
        board.innerHTML = data.html;
    });

    sendButton.onclick = sendMessage = function() {
        var text = field.value;
        socket.emit('send', { message: text, username: user });
        field.value = "";
    };

    //var b = vnc.Server('chung', 'son').board('son');
    //board.innerHTML = b.toHtml();
    //alert('done');
}
