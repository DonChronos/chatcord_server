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

io.on('connection', socket => {
  console.log('New ws connection...');

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left the chat');
    console.log('a user disconnected');
  })
})

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on ${PORT}`))
