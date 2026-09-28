/**
 * Singleton Socket.IO client service.
 *
 * - Uses VITE_SOCKET_URL env var (falls back to current origin in production,
 *   or localhost:9007 in development).
 * - Starts with polling transport so the HTTP handshake can complete first,
 *   then upgrades to WebSocket automatically (the default Socket.IO behaviour).
 *   This is the fix for "WebSocket closed before the connection is established".
 * - Reconnects automatically with exponential back-off.
 * - lazy=true means the connection is NOT opened until connect() is called,
 *   preventing a socket being opened before the user is authenticated.
 */

import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? 'http://localhost:9007' : window.location.origin);

const socket = io(SOCKET_URL, {
  // Start with polling so the HTTP handshake completes, then upgrade to WS.
  // DO NOT set transports: ['websocket'] only — that skips the handshake
  // and causes "WebSocket closed before connection is established".
  transports: ['polling', 'websocket'],

  // Path must match server-side Socket.IO path (default '/socket.io').
  path: '/socket.io',

  // Pass cookies so JWT session is forwarded for authenticated sockets.
  withCredentials: true,

  // Reconnection settings.
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,

  // Timeout before a connection attempt is abandoned.
  timeout: 20000,

  // Do NOT auto-connect — connect manually after the user is known.
  autoConnect: false,
});

export default socket;
