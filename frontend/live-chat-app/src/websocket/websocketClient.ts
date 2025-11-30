import WebSocket from 'ws';

const ws = new WebSocket('ws://fabbernatvasvari.github.io/Kanti-onallo-projekt-feladat-16-live-chat-app/', {
  perMessageDeflate: false
});