import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Configuration & DB
dotenv.config();
import { connectDB } from './config/db.js';
import { initEmailTransporter } from './services/emailService.js';
import { initExpiryCronJob } from './services/cronService.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import instrumentRoutes from './routes/instrumentRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import allocationRoutes from './routes/allocationRoutes.js';
import inspectionRoutes from './routes/inspectionRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

// Middlewares
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Ensure upload folders exist
const uploadsDir = path.resolve('uploads');
const certsDir = path.resolve('uploads', 'certificates');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });

// Core Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Photos & Generated Certificates statically
app.use('/uploads', express.static(path.resolve('uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Legal Metrology Verification & Digital Certification API',
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/instruments', instrumentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/public', publicRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  await connectDB();
  await initEmailTransporter();
  initExpiryCronJob();

  app.listen(PORT, () => {
    console.log(`🚀 Legal Metrology Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📡 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });
};

startServer();
