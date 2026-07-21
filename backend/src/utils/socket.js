const socketIo = require('socket.io');

let io;

const init = (server) => {
  // Restrict Socket.io CORS to the frontend URL in production
  const socketOrigin = process.env.FRONTEND_URL || '*';

  io = socketIo(server, {
    cors: {
      origin: socketOrigin,
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
