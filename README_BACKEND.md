# Group Study Backend Setup

This is the WebSocket backend for the calendar's group study feature.

## Installation

1. Make sure you have Node.js installed (version 14 or higher)

2. Install dependencies:
```bash
npm install
```

## Running the Server

Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The server will start on `ws://localhost:3000`

## How It Works

- **Create Session**: Users can create a new study session with a unique 6-character code
- **Join Session**: Other users can join by entering the session code
- **Real-time Chat**: All messages are synchronized across all participants in real-time
- **Participant Tracking**: See who's online in your study session

## WebSocket Message Protocol

### Client → Server

**Join Session:**
```json
{
  "type": "join",
  "sessionCode": "ABC123",
  "userName": "User123"
}
```

**Send Message:**
```json
{
  "type": "message",
  "sessionCode": "ABC123",
  "userName": "User123",
  "message": "Hello everyone!"
}
```

**Leave Session:**
```json
{
  "type": "leave",
  "sessionCode": "ABC123",
  "userName": "User123"
}
```

### Server → Client

**Joined Confirmation:**
```json
{
  "type": "joined",
  "sessionCode": "ABC123",
  "participants": ["User123", "User456"]
}
```

**User Joined:**
```json
{
  "type": "user_joined",
  "userName": "User789"
}
```

**User Left:**
```json
{
  "type": "user_left",
  "userName": "User456"
}
```

**Receive Message:**
```json
{
  "type": "message",
  "userName": "User456",
  "message": "Great point!"
}
```

**Error:**
```json
{
  "type": "error",
  "message": "Session not found"
}
```

## Deployment

For production deployment:

1. Update the `BACKEND_URL` in `index.html` to your deployed server URL
2. Deploy to services like:
   - Heroku
   - Railway
   - Render
   - DigitalOcean
   - AWS EC2

## Security Notes

For production use, consider adding:
- User authentication
- Session expiration
- Rate limiting
- Message sanitization
- SSL/TLS encryption (use wss://)
