import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import job from './lib/cron.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());

connectDB();

app.use(cors());
job.start();
app.get('/', (req, res) => {
    res.send('Welcome to the BookWorm API');
  });

  
  app.use('/api/auth', authRoutes);
  app.use('/api/book',bookRoutes); 


  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));