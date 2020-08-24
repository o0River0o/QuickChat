require('dotenv').config()
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: roomId } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/rooms/', (req, res) => {
    res.redirect(`/rooms/${roomId()}`);
});

app.get('/rooms/:room', (req, res) => {
    res.render('rooms/room', { roomId: req.params.room })
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
        })
    })
});

console.log(`[INFO] Server is running on ${process.env.PORT}`);
server.listen(process.env.PORT)