import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files from root
app.use(express.static(__dirname));

// Initialize Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'YAS Order & Delivery API' });
});

// API Routes (for future backend integration)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', supabase: !!supabase });
});

// Orders API
app.get('/api/orders', async (req, res) => {
  if (!supabase) {
    return res.json({ message: 'Using localStorage - no backend yet' });
  }
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  if (!supabase) {
    return res.status(501).json({ error: 'Backend not configured' });
  }
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([req.body])
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  if (!supabase) {
    return res.status(501).json({ error: 'Backend not configured' });
  }
  try {
    const { data, error } = await supabase
      .from('orders')
      .update(req.body)
      .eq('id', req.params.id)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/driver', (req, res) => {
  res.sendFile(path.join(__dirname, 'driver.html'));
});

app.get('/track', (req, res) => {
  res.sendFile(path.join(__dirname, 'track.html'));
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 YAS Order & Delivery running on http://localhost:${PORT}`);
  if (supabase) {
    console.log('✅ Supabase connected');
  } else {
    console.log('⚠️ Supabase not configured (using localStorage)');
  }
});
