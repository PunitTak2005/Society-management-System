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
const server = http.createServer(app);

// Allowed origins for CORS (Express & Socket.io)
const allowedOrigins = [
  'https://punitdevops.shop',
  'https://www.punitdevops.shop',
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
  cors: corsOptions,
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

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', UserRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/flats', flatRoutes);
app.use('/api/v1', visitorsRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/bills', billRoutes);

// Initialize the real-time Notification Service
notificationService.init(io);

// Re-export userConnectionDetails for legacy compatibility in other controllers
export const userConnectionDetails = notificationService.userConnectionDetails;

app.on('connection', () => {
  console.log('connected');
});

server.listen(3000, () => {
  console.log('server is running');
});
