// WebSocket Server for Group Study Feature
// Install dependencies: npm install ws

const WebSocket = require('ws');
const http = require('http');

const PORT = 3000;

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store active sessions
// Structure: { sessionCode: { participants: Map, messages: [] } }
const sessions = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  let currentSession = null;
  let currentUserName = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      switch (data.type) {
        case 'join':
          handleJoin(ws, data);
          break;
          
        case 'message':
          handleMessage(ws, data);
          break;
          
        case 'leave':
          handleLeave(ws, data);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (currentSession && currentUserName) {
      handleLeave(ws, {
        sessionCode: currentSession,
        userName: currentUserName
      });
    }
  });

  function handleJoin(ws, data) {
    const { sessionCode, userName } = data;
    
    if (!sessionCode || !userName) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Session code and username required'
      }));
      return;
    }

    // Create session if it doesn't exist
    if (!sessions.has(sessionCode)) {
      sessions.set(sessionCode, {
        participants: new Map(),
        messages: []
      });
      console.log(`Created new session: ${sessionCode}`);
    }

    const session = sessions.get(sessionCode);
    
    // Add user to session
    session.participants.set(userName, ws);
    currentSession = sessionCode;
    currentUserName = userName;

    // Get list of participants
    const participants = Array.from(session.participants.keys());

    // Notify user they joined
    ws.send(JSON.stringify({
      type: 'joined',
      sessionCode: sessionCode,
      participants: participants
    }));

    // Notify all other participants
    broadcast(sessionCode, {
      type: 'user_joined',
      userName: userName
    }, userName);

    console.log(`${userName} joined session ${sessionCode}`);
  }

  function handleMessage(ws, data) {
    const { sessionCode, userName, message } = data;
    
    if (!sessions.has(sessionCode)) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Session not found'
      }));
      return;
    }

    const session = sessions.get(sessionCode);
    
    // Store message
    session.messages.push({
      userName,
      message,
      timestamp: Date.now()
    });

    // Broadcast to all other participants
    broadcast(sessionCode, {
      type: 'message',
      userName: userName,
      message: message
    }, userName);

    console.log(`Message in ${sessionCode} from ${userName}: ${message}`);
  }

  function handleLeave(ws, data) {
    const { sessionCode, userName } = data;
    
    if (!sessions.has(sessionCode)) return;

    const session = sessions.get(sessionCode);
    session.participants.delete(userName);

    // Notify all participants
    broadcast(sessionCode, {
      type: 'user_left',
      userName: userName
    });

    // Clean up empty sessions
    if (session.participants.size === 0) {
      sessions.delete(sessionCode);
      console.log(`Deleted empty session: ${sessionCode}`);
    }

    console.log(`${userName} left session ${sessionCode}`);
  }

  function broadcast(sessionCode, data, excludeUser = null) {
    if (!sessions.has(sessionCode)) return;

    const session = sessions.get(sessionCode);
    const message = JSON.stringify(data);

    session.participants.forEach((clientWs, userName) => {
      if (userName !== excludeUser && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(message);
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
  console.log('Waiting for connections...');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
