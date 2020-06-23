const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const rooms = ['HTML', 'CSS', 'JAVASCRIPT'];

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'Chatcord Bot';

io.on('connection', socket => {
  console.log('New ws connection...');
  socket.on('joinRoom', ({ userId, activeRoom }) => {
    const user = userJoin(socket.id, userId, activeRoom);
    console.log(user);
    socket.join(user.room);
    socket.emit('message', formatMessage(botName, 'Welcome to Chatcord!'));
    socket.broadcast.to(user.room).emit(
      'message',
     formatMessage(botName, `${user.username} has joined the chat`));

     io.to(user.room).emit('roomUsers', {
       room: user.room,
       users: getRoomUsers(user.room)
     })
  });
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
    )
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
    console.log('a user disconnected');
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on ${PORT}`))
