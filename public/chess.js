$(document).ready(function() {
    $("#field").keyup(function(e) {
        if(e.keyCode == 13) {
            sendMessage();
        }
    });
});


window.onload = function() {
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var welcome = document.getElementById("welcome");
    var allUsers = document.getElementById("users");
    var chatElem = document.getElementById("chat");
    var boardElem = document.getElementById("board");
    var board, user, last;
    var socket = io.connect(document.URL);

    // handler for board click
    handleClick = function(elem, pos, type) {
        // need to get piece selected first
        if (!last && type && type.indexOf(board.turn) >= 0) {
            elem.className += ' selected';
            last = {elem: elem, pos: pos, type: type};
        } else if (last) {
            if (type.indexOf(board.turn) >= 0) {
                // remove the selected class for last selected elem
                var klass = last.elem.className;
                last.elem.className = klass.substring(0, klass.length-9);
                // and select this one
                elem.className += ' selected';
                last = {elem: elem, pos: pos, type: type};
            } else {
                var move = vnc.Board.prototype.getMove.call(board, last.type, last.pos, pos);
                if (move) {
                    // remove the selected class for last selected elem
                    var klass = last.elem.className;
                    klass = klass.substring(0, klass.length-9);
                    console.log(move);
                    socket.emit('send', { message: move, username: user });
                    last = null;
                }
            }
        }
    };

    socket.on('welcome', function (data) {
        user = data.name;
        welcome.innerHTML = "<strong>" + data.name + "</strong>: welcome to vinachess.net, please enjoy.";
    });
    socket.on('updateChat', function (data) {
        chatElem.innerHTML = data.message + '<br/>' + chatElem.innerHTML;
    });
    socket.on('users', function (data) {
        allUsers.innerHTML = "<strong>Users:</strong><br />" + data.users;
    });
    socket.on('game', function (data) {
        board = data.board;
        boardElem.innerHTML = data.html;
    });

    sendButton.onclick = sendMessage = function() {
        var text = field.value;
        socket.emit('chat', { message: text, username: user });
        field.value = "";
    };

}
