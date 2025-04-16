const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

let lampState = false;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/lamp', (req, res) => {
  res.json({ on: lampState });
});

app.post('/api/lamp', (req, res) => {
  lampState = !lampState;
  broadcastLampState();
  res.json({ on: lampState });
});

function broadcastLampState() {
  const data = JSON.stringify({ on: lampState });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ on: lampState }));
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
