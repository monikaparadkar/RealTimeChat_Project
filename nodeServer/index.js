const io = require('socket.io')(8000, { cors: { origin: "*" } });

const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', userName => {
        console.log('New user joined:', userName);
        users[socket.id] = userName;
        socket.broadcast.emit('user-joined', { userName, users });
        io.emit('update-user-list', users);
    });

    socket.on('send-message', message => {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        socket.broadcast.emit('receive-message', { message: message, userName: users[socket.id], timestamp });
    });

    socket.on('typing', () => {
        socket.broadcast.emit('user-typing', users[socket.id]);
    });

    socket.on('stop-typing', () => {
        socket.broadcast.emit('user-stop-typing', users[socket.id]);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-left', users[socket.id]);
        delete users[socket.id];
        io.emit('update-user-list', users);
    });
});
