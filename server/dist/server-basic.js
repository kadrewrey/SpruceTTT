"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
app.use((err, req, res, next) => {
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
exports.default = app;
