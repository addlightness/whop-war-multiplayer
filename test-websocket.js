// Simple WebSocket client test
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');
  
  // Test joining queue
  ws.send(JSON.stringify({
    type: 'join_queue',
    data: {
      playerId: 'test_player_1',
      name: 'Test Player 1'
    }
  }));
  
  console.log('📤 Sent join_queue message');
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('📥 Received:', message.type, message.data);
  
  if (message.type === 'queue_joined') {
    console.log('🎯 Successfully joined queue!');
    setTimeout(() => {
      ws.close();
      console.log('🔌 Connection closed');
    }, 2000);
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
});

ws.on('close', () => {
  console.log('🔌 WebSocket connection closed');
});
