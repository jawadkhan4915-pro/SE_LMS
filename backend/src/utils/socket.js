const socketIo = require('socket.io');

let io;

const init = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    const { userId, role, department } = socket.handshake.query;
    
    if (userId) {
      socket.join(userId);
    }
    if (role) {
      socket.join(role);
    }
    if (department) {
      socket.join(department);
    }

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

module.exports = { init, getIO };
