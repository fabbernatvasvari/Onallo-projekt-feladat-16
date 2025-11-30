import WebSocket from 'ws';

const ws = new WebSocket('ws://fabbernatvasvari.github.io/Kanti-onallo-projekt-feladat-16-live-chat-app/');

ws.on('error', console.error);

ws.on('open', function open() {
  ws.send('something');
});

ws.on('message', function message(data) {
  console.log('received: %s', data);
});