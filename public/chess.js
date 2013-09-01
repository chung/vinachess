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
    var board, username, last, rotation = vnc.Piece.BLACK;
    var waitingForOther = false;
    var url = document.URL;
    var index = url.indexOf('room=');
    var room = index < 0 ? 'public' : url.substring(index+5, url.length);

    var socket = io.connect(url);
    socket.emit('join', { room: room });
    // handler for board click
    handleClick = function(elem, pos, type) {
        if (waitingForOther) return;
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
                var move = vnc.Board.prototype.getMove.call(board, last.type, last.pos, pos, rotation);
                if (move) {
                    // remove the selected class for last selected elem
                    last.elem.className = 'piece ' + last.pos;
                    // and select this one
                    elem.className = elem.className.replace(type, '') + ' selected ' + last.type;
                    console.log(move);
                    board = vnc.Board.prototype.move.call(board, move); // move this board, then broadcast to others
                    socket.emit('send', { message: move, username: username });
                    last = null;
                    waitingForOther = true;
                }
            }
        }
    };

    socket.on('welcome', function (data) {
        username = data.name;
        welcome.innerHTML = "<strong>" + data.name + "</strong>: welcome to vinachess.net";
    });

    socket.on('restart', function () {
        $('#status').html("Server's restarted, refresh your browser now!");
        setTimeout(function() { location.reload(true) }, 2000);
     });

    socket.on('updateChat', function (data) {
        chatElem.innerHTML = data.message + '<br/>' + chatElem.innerHTML;
    });

    socket.on('users', function (data) {
        var str = '', count = 0;
        for(var i = 0; i < data.users.length; i++) {
            var user = data.users[i];
            if (user.room) {
                count += 1;
                str += user.name + ' <small>(' + user.room + ')</small><br />';
            }
        }
        allUsers.innerHTML = "<strong>There are " + count + " online users:</strong><br />" + str;
    });

    socket.on('board', function (data) {
        board = data;
        waitingForOther = false;
        boardElem.innerHTML = vnc.Board.prototype.toHtml.call(board, rotation);
        var color = board.turn ? 'RED' : 'BLACK';
        $('#turn').html(color).attr('class', color);
    });

    sendButton.onclick = sendMessage = function() {
        var text = field.value;
        socket.emit('chat', { message: text, username: username });
        field.value = "";
    };

    $('#undo').click(function() {
        socket.emit('undo');
    });

    $('#redo').click(function() {
        socket.emit('redo');
    });

    $('#new').click(function() {
        socket.emit('new');
    });

    $('#rotate').click(function() {
        rotation = vnc.Piece.WHITE - rotation;
        boardElem.innerHTML = vnc.Board.prototype.toHtml.call(board, rotation);
    });
}
