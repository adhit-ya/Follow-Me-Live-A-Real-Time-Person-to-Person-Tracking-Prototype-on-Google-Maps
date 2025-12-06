const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('public'));

const httpServer = http.createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

const sessions = {};

function genId(length = 8) {
  return [...Array(length)].map(() => Math.random().toString(36)[2]).join('');
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('create-session', (cb) => {
    const id = genId(10);
    sessions[id] = { sharer: null };
    cb({ sessionId: id });
  });

  socket.on('join-session', ({ sessionId, role }) => {
    if (!sessions[sessionId]) {
      socket.emit('session-error', { msg: 'Invalid session' });
      return;
    }

    socket.join(`session:${sessionId}`);
    socket.sessionId = sessionId;
    socket.role = role;

    if (role === 'sharer') {
      sessions[sessionId].sharer = socket.id;
    }
  });

  socket.on('sharer-location', ({ sessionId, lat, lng, ts, speed, heading }) => {
    io.to(`session:${sessionId}`).emit('sharer-location', {
      lat, lng, ts, speed, heading
    });
  });

  socket.on('follower-location', ({ sessionId, lat, lng, ts }) => {
    io.to(`session:${sessionId}`).emit('follower-location', {
      lat, lng, ts, id: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Live tracker socket server running');
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
