import express from 'express';
import dotenv from 'dotenv';
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
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});


app.use(express.json());
app.use('/public', express.static(path.join(process.cwd(), 'public')));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

dotenv.config();
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

//deployment client + back
