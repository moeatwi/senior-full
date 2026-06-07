import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import productsRouter from './products.js';
import authRouter from './auth.js';


const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

app.get('/', (req, res) => {
  res.json({ status: 'API running' });
});

app.use('/api/products', productsRouter(supabase));

app.use('/api/auth', authRouter(supabase));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
