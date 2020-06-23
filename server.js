const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  changeUserRoom
} = require('./utils/users');

const rooms = ['HTML', 'CSS', 'JAVASCRIPT'];

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'Chatcord Bot';

io.on('connection', socket => {
  console.log('New ws connection...');
  socket.on('joinRoom', ({ userId, activeRoom }) => {
    const user = userJoin(socket.id, userId, activeRoom.name);
    console.log(user);
    socket.join(user.room);
    socket.emit('message', formatMessage(botName, 'Welcome to Chatcord!'));
    socket.broadcast.to(user.room).emit(
      'message',
     formatMessage(botName, `${user.username} has joined the chat`)
   );

     io.to(user.room).emit('roomUsers', {
       room: user.room,
       users: getRoomUsers(user.room)
     })
  });
  socket.on('changeRoom', ({ userId, lastRoom, activeRoom }) => {
    socket.broadcast.to(lastRoom.name).emit(
      'message',
     formatMessage(botName, `${userId} has left this room`)
   );
   socket.broadcast.to(lastRoom.name).emit('roomUsers', {
     room: lastRoom.name,
     users: getRoomUsers(lastRoom.name)
   })
    socket.leave(lastRoom.name);
    const user = changeUserRoom(socket.id, userId, activeRoom.name);
    socket.join(activeRoom.name);
    socket.emit('message', formatMessage(botName, 'Welcome to Chatcord!'));
    socket.broadcast.to(activeRoom.name).emit(
      'message',
     formatMessage(botName, `${userId} has joined this room`)
   );
   io.to(activeRoom.name).emit('roomUsers', {
     room: activeRoom.name,
     users: getRoomUsers(activeRoom.name)
   })
  })
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
