import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); // Moved to the top so environment variables are available immediately

import connectDb from './db/config.js';
import authRoutes from './routes/auth.routes.js';
import roleRoutes from './routes/role.routes.js';
import flatRoutes from './routes/flat.routes.js';
import UserRoutes from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import visitorsRoutes from './routes/visitors.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import noticeRoutes from './routes/notice.routes.js';
import billRoutes from './routes/bill.routes.js';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import path from 'path';
import notificationService from './lib/notificationService.js';
import { initPrivacyWorker } from './lib/privacyCleanup.js';

const app = express();
app.set('trust proxy', 1); // Trust HAProxy reverse proxy

const server = http.createServer(app);

// Allowed origins for CORS (Express & Socket.io)
const allowedOrigins = [
  'https://punitdevops.shop',
  'https://www.punitdevops.shop',
  'http://localhost:3258',
  'http://localhost:5173',
  process.env.CLIENT_URL // Keeps support for your env variable if defined
].filter(Boolean); // Filters out undefined values if CLIENT_URL isn't set

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
};

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  path: "/socket.io/"
});

app.use(express.json());
app.use('/public', express.static(path.join(process.cwd(), 'public')));

app.use(cors(corsOptions));

app.use(cookieParser());

//NOTE  function to connect with mongodb
connectDb();
initPrivacyWorker();

app.use((req,res,next)=>{
  req.io = io  ;
  next();
})

app.get('/health', (req, res) => {
  res.send('Health is ok.');
});

// Mount routes for both /api/v1 and /api prefixes
const mountRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}`, UserRoutes);
  app.use(`${prefix}/roles`, roleRoutes);
  app.use(`${prefix}/flats`, flatRoutes);
  app.use(`${prefix}`, visitorsRoutes);
  app.use(`${prefix}/complaints`, complaintRoutes);
  app.use(`${prefix}/notices`, noticeRoutes);
  app.use(`${prefix}/bills`, billRoutes);
};

mountRoutes('/api/v1');
mountRoutes('/api');

// Initialize the real-time Notification Service
notificationService.init(io);

// Re-export userConnectionDetails for legacy compatibility in other controllers
export const userConnectionDetails = notificationService.userConnectionDetails;

app.on('connection', () => {
  console.log('connected');
});

server.listen(process.env.PORT || 9007, () => {
  console.log(`server is running on port ${process.env.PORT || 9007}`);
});
