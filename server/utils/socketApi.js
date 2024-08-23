const socketIo = require("socket.io");

const initializeSocketIo = (server, options) => {
    const io = socketIo(server, options);

    io.on("connection", (socket) => {
        // store data to an array

        socket.on('join', (data) => {
            console.log(data)
        })

        socket.on('join-room', ({ roomId, name }) => {
            socket.join(roomId);
            socket.to(roomId).emit("new-user", name);
        })

        socket.on('send-stroke', ({ roomId, stroke }) => {
            socket.to(roomId).emit("receave-stroke", stroke);
        })

        socket.on('send-undo', (roomId) => {
            socket.to(roomId).emit("receave-undo");
        });

        socket.on('send-redo', (roomId) => {
            socket.to(roomId).emit("receave-redo");
        });

        socket.on('send-clear-canvas', (roomId) => {
            socket.to(roomId).emit("receave-clear-canvas");
        });

        socket.on('is-room-exist', (roomId) => {
            const room = io.sockets.adapter.rooms.get(roomId);
            if (!room) {
                socket.emit("room-exist-status", { status: false, roomId: roomId });
            } else {
                socket.join(roomId);
                socket.emit("room-exist-status", { status: true, roomId: roomId });
                socket.to(roomId).emit("new-user");
            }
        })

        socket.on("close-room", (roomId) => {
            const room = io.sockets.adapter.rooms.get(roomId);

            if (room) {
                socket.to(roomId).emit("room-closed");
                const clients = Array.from(room);
                clients.forEach((clientId) => {
                    const socket = io.sockets.sockets.get(clientId);
                    if (socket) {
                        socket.leave(roomId);
                    }
                });
            }
        })
            


            socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    })
    return io;
}

module.exports = initializeSocketIo;