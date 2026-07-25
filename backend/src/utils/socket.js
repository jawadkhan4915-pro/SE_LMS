const socketIo = require('socket.io');

let io;

const init = (server) => {
  const defaultOrigins = [
    'https://university-lms-rho.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  const envOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : [];
  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  io = socketIo(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, '');
        const isAllowed = allowedOrigins.some(allowed => allowed.replace(/\/$/, '') === cleanOrigin);
        if (isAllowed) return callback(null, true);
        callback(new Error('CORS not allowed for Socket.IO'));
      },
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
