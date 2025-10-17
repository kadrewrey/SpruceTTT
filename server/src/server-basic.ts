import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Spruce Tic-Tac-Toe Server is running!' 
  });
});

// Basic API routes
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'API is working',
    version: '1.0.0',
    features: ['user-auth', 'game-storage', 'statistics']
  });
});

// Placeholder routes for future database integration
app.post('/api/register', (req, res) => {
  res.status(501).json({ 
    error: 'Database not configured yet',
    message: 'Please set up your DATABASE_URL in .env file'
  });
});

app.post('/api/login', (req, res) => {
  res.status(501).json({ 
    error: 'Database not configured yet',
    message: 'Please set up your DATABASE_URL in .env file'
  });
});

app.get('/api/games', (req, res) => {
  res.status(501).json({ 
    error: 'Database not configured yet',
    message: 'Please set up your DATABASE_URL in .env file'
  });
});

app.post('/api/games', (req, res) => {
  res.status(501).json({ 
    error: 'Database not configured yet',
    message: 'Please set up your DATABASE_URL in .env file'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Spruce Tic-Tac-Toe Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API status: http://localhost:${PORT}/api/status`);
  console.log('');
  console.log('⚠️  To enable database features:');
  console.log('   1. Get your Neon database URL');
  console.log('   2. Update DATABASE_URL in .env file');
  console.log('   3. Run: npm run db:push');
  console.log('   4. Restart the server');
});

export default app;