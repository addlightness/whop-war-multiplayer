# Multiplayer War Card Game

A real-time multiplayer version of the classic War card game built with Next.js, WebSockets, and Whop integration.

## Features

- **Real-time multiplayer gameplay** using WebSockets
- **Dual matchmaking system**:
  - Quick match (join queue)
  - Private games with join codes
- **Turn-based gameplay** with proper game state synchronization
- **War mechanics** with face-down cards during ties
- **Whop integration** for user authentication and access control
- **Responsive UI** with connection status indicators

## Quick Start

### Prerequisites

- Node.js 20.9.0+
- Whop app credentials

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd whop-war-multiplayer
```

2. Install dependencies:
```bash
npm install
```

3. Start the WebSocket server:
```bash
npm run dev:ws
```

4. Start the Next.js development server:
```bash
npx next dev --turbopack
```

5. Open `test.html` in two browser windows to test multiplayer functionality

## Testing

### Using the Test Page

1. Open `test.html` in two browser windows
2. In one window: Click "Create Private Game" and copy the join code
3. In the other window: Click "Join Private Game" and enter the code
4. Play the game!

### Using the Whop App

1. Set up your Whop app credentials in `.env.local`
2. Navigate to your Whop experience URL
3. Use the same process as the test page

## Architecture

- **Frontend**: Next.js 16 with React 19, Tailwind CSS
- **Backend**: Next.js API routes + standalone WebSocket server
- **Real-time**: Plain WebSocket (no Socket.io overhead)
- **State Management**: In-memory Maps (KISS principle)
- **Authentication**: Whop SDK integration

## WebSocket Protocol

### Client → Server Messages

- `join_queue`: Join matchmaking queue
- `create_game`: Create private game
- `join_game`: Join with code
- `game_action`: Draw card or resolve war
- `ping`: Keep connection alive

### Server → Client Messages

- `game_update`: Game state changes
- `queue_joined`: Confirmation of queue join
- `game_created`: Private game created with code
- `opponent_disconnected`: Handle disconnections
- `pong`: Response to ping

## What Would Elon Do?

This implementation follows the "KISS" principle:

- ✅ No Socket.io (unnecessary abstraction)
- ✅ No database (in-memory only)
- ✅ Simple reconnection (basic timeout)
- ✅ One WebSocket server file (~200 lines)
- ✅ Ship fast, iterate based on usage

## Deployment

### WebSocket Server

The WebSocket server runs on port 3001 by default. For production:

1. Deploy to a platform that supports WebSockets (Render, Railway, etc.)
2. Update `NEXT_PUBLIC_WS_URL` environment variable
3. Consider using a reverse proxy (nginx) for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with two browser windows
5. Submit a pull request

## License

MIT License