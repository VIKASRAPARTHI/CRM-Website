
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from '../dist/index.js';

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO if needed
// const io = new Server(server);

// Export for serverless use
export default server;
