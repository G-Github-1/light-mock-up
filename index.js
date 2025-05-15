const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;
const colors = ["Normal", "Warm", "Cool"];

let lampState = false;
let colorindex = 0;
let colorState = colors[colorindex];

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/lamp/status', (req, res) => {
  res.json({ 
    on: lampState,
    color: colorState
   });
});

app.post('/lamp/toggle', (req, res) => {
  lampState = !lampState;
  broadcastLampState();
  res.json({ on: lampState });
});

app.post('/lamp/color', (req, res) => {
  colorindex = (colorindex + 1) % 3;
  colorState = colors[colorindex];
  broadcastLampState();
  res.json({ color: colorState });
});

function broadcastLampState() {
  const data = JSON.stringify({ on: lampState, color:colorState });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ on: lampState, color:colorState }));
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));