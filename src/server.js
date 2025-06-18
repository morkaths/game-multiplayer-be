import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import webRoutes from './routes/web.js';
import apiRoutes from './routes/api.js';
import socketHandler from './socket/socketHandler.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// REST API routes
app.use('/', webRoutes);
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        path: req.path
    });
});

// =====================
// Socket.IO logic block
// =====================
socketHandler(io);

// =====================
// Start server
// =====================
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('Server is running:');
    console.log(`- API URL: http://${HOST}:${PORT}`);
    console.log(`- Test endpoint: http://${HOST}:${PORT}/api/test`);
    console.log(`- Register endpoint: http://${HOST}:${PORT}/api/auth/register`);
    console.log(`- Login endpoint: http://${HOST}:${PORT}/api/auth/login`);
});