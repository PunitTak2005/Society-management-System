/**
 * Singleton Socket.IO client service.
 *
 * - Uses VITE_SOCKET_URL env var (falls back to current origin in production,
 *   or localhost:9007 in development).
 * - Connects directly with websocket transport to bypass sticky session polling
 *   issues across multiple backend pod replicas on Kubernetes.
 * - Reconnects automatically with exponential back-off.
 * - lazy=true means the connection is NOT opened until connect() is called,
 *   preventing a socket being opened before the user is authenticated.
 */

import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? 'http://localhost:9007' : 'https://www.punitdevops.shop');

const socket = io(SOCKET_URL, {
  // Directly connect over WebSocket to bypass sticky session polling issues across Kubernetes pods
  transports: ['websocket'],

  // Path must match server-side Socket.IO path
  path: '/socket.io',

  // Pass cookies so JWT session is forwarded for authenticated sockets
  withCredentials: true,

  // Reconnection settings
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,

  // Timeout before a connection attempt is abandoned
  timeout: 20000,

  // Do NOT auto-connect — connect manually after the user is known
  autoConnect: false,
});

export default socket;
