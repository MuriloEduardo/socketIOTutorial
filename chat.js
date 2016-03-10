var express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  io = require('socket.io').listen(server);

server.listen(3000);

app.get('/', function(req, res) {
  console.log("Delivering");
  res.sendFile(__dirname + '/index.html');
});

var usernames = {};
var rooms = ['room1', 'SergiosRoom', 'JohnsRoom'];

io.sockets.on('connection', function(socket) {
  console.log("User Sort of connected");

  socket.on('addUser', function(username) {
    console.log(username)
    socket.username = username;

    console.log(username + " has logged");

    socket.room = rooms[0];

    usernames[username] = socket.username;

    socket.join(socket.room);

    //emit to the client that hes joined a room
    updateClient(socket, username, socket.room);

    updateChatRoom(socket, 'connected');

    //TODO: Add updating the room list

  });

  //send messages
  socket.on('sendChat', function(data) {
    console.log(socket.username + " sent a message");
    io.sockets.in(socket.room).emit('updateChat', socket.username, data);
  });


  ///SWITCH ROOM CODE GOES HERE

  socket.on('disconnect', function() {
    delete usernames[socket.username];

    io.sockets.emit('updateUsers', usernames);


    updateGlobal(socket, 'disconnected');

    socket.leave(socket.room);
  })
});

function updateClient(socket, username, newRoom) {
  socket.emit('updateChat', 'SERVER', 'You\'ve connected ' + newRoom);
}

function updateChatRoom(socket, message) {
  socket.broadcast.to(socket.room).emit('updateChat', 'SERVER', socket.username + ' has ' + message);
}

function updateGlobal(socket, message) {
  socket.broadcast.emit('updateChat', 'SERVER', socket.username + ' have ' + message);
}
