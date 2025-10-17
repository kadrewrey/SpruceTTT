"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
// Load environment variables from root .env file
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("./db");
const schema_1 = require("./schema");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Serve static files from client build (in production)
const clientBuildPath = path_1.default.join(__dirname, '../../client/dist');
app.use(express_1.default.static(clientBuildPath));
// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401);
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
};
// Routes
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, nickname } = req.body;
        if (!username || !password || !nickname) {
            return res.status(400).json({ error: 'Username, password, and nickname are required' });
        }
        // Validate nickname length
        if (nickname.length > 15) {
            return res.status(400).json({ error: 'Nickname must be 15 characters or less' });
        }
        // Check if user already exists
        const existingUser = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // Create user
        const newUser = {
            username,
            nickname,
            password: hashedPassword,
        };
        const [createdUser] = await db_1.db.insert(schema_1.users).values(newUser).returning();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: createdUser.id, username: createdUser.username, nickname: createdUser.nickname }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
            message: 'User created successfully',
            user: { id: createdUser.id, username: createdUser.username, nickname: createdUser.nickname },
            token,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// User login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        // Find user
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Verify password
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username, nickname: user.nickname }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            message: 'Login successful',
            user: { id: user.id, username: user.username, nickname: user.nickname },
            token,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Save game result
app.post('/api/games', async (req, res) => {
    try {
        const { boardSize, isWin, moves, duration, winnerId, playerXId, playerOId } = req.body;
        // Check if request has authentication token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        let userId = null;
        // If token is provided, verify it and get userId
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                userId = decoded.userId;
            }
            catch (err) {
                // Invalid token, but we'll still save as guest game
                console.log('Invalid token provided, saving as guest game');
            }
        }
        if (typeof boardSize !== 'number' || typeof isWin !== 'boolean' || typeof moves !== 'number') {
            return res.status(400).json({ error: 'Invalid game data' });
        }
        const newGame = {
            playerId: userId, // Will be null for guest games
            boardSize,
            isWin,
            moves,
            duration: duration || null,
            winnerId: winnerId || null,
            playerXId: playerXId,
            playerOId: playerOId,
        };
        const [createdGame] = await db_1.db.insert(schema_1.games).values(newGame).returning();
        res.status(201).json({
            message: 'Game saved successfully',
            game: createdGame,
        });
    }
    catch (error) {
        console.error('Save game error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get user's game history
app.get('/api/games', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userGames = await db_1.db.select().from(schema_1.games).where((0, drizzle_orm_1.eq)(schema_1.games.playerId, userId));
        res.json({
            games: userGames,
        });
    }
    catch (error) {
        console.error('Get games error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Get user's game stats
        const userGames = await db_1.db.select().from(schema_1.games).where((0, drizzle_orm_1.eq)(schema_1.games.playerId, userId));
        const totalGames = userGames.length;
        // Calculate wins: games where user is the winner OR isWin is true (for older format)
        const wins = userGames.filter((game) => game.winner === user.username || (game.isWin && !game.winner)).length;
        // Calculate draws: games where there's no winner and isWin is false
        const draws = userGames.filter((game) => !game.winner && !game.isWin).length;
        const losses = totalGames - wins - draws;
        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
        res.json({
            user: { id: user.id, username: user.username, createdAt: user.createdAt },
            stats: {
                totalGames,
                wins,
                losses,
                draws,
                winRate: Math.round(winRate * 100) / 100,
            },
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get available guest accounts
app.get('/api/guest-accounts', async (req, res) => {
    try {
        const guestAccounts = await db_1.db.select({
            username: schema_1.users.username,
        }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.isGuestAccount, true));
        res.json({
            guestAccounts: guestAccounts.map(account => account.username),
        });
    }
    catch (error) {
        console.error('Get guest accounts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Guest login endpoint
app.post('/api/guest-login', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        // Find the guest account
        const [guestUser] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
        if (!guestUser || !guestUser.isGuestAccount) {
            return res.status(404).json({ error: 'Guest account not found' });
        }
        // Create a JWT token for the guest user
        const token = jsonwebtoken_1.default.sign({ userId: guestUser.id, username: guestUser.username, isGuest: true }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Guest login successful',
            user: { id: guestUser.id, username: guestUser.username },
            token,
        });
    }
    catch (error) {
        console.error('Guest login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get guest player stats
app.get('/api/guest-stats/:playerName', async (req, res) => {
    try {
        const { playerName } = req.params;
        // Get all games where this guest player participated
        // First find the user by username to get their UUID
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, playerName));
        if (!user) {
            return res.json({
                totalGames: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                winRatio: 0
            });
        }
        const playerGames = await db_1.db.select().from(schema_1.games).where(
        // Get games where playerXId or playerOId matches the user's UUID
        (0, drizzle_orm_1.sql) `${schema_1.games.playerXId} = ${user.id} OR ${schema_1.games.playerOId} = ${user.id}`);
        const totalGames = playerGames.length;
        if (totalGames === 0) {
            return res.json({
                stats: {
                    totalGames: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    winRate: 0,
                },
            });
        }
        // Calculate wins: games where this guest player is the winner
        const wins = playerGames.filter((game) => game.winner === playerName).length;
        // Calculate draws: games where winner is null (but game was played)
        const draws = playerGames.filter((game) => game.winner === null).length;
        // Losses are total games minus wins and draws
        const losses = totalGames - wins - draws;
        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
        res.json({
            stats: {
                totalGames,
                wins,
                losses,
                draws,
                winRate: Math.round(winRate * 100) / 100,
            },
        });
    }
    catch (error) {
        console.error('Get guest stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get user stats by user ID (unified endpoint for both regular and guest users)
app.get('/api/users/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        // Get the user to verify they exist and get their username
        const user = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const username = user[0].username;
        // Get all games where this user participated (by UUID)
        const userGames = await db_1.db.select().from(schema_1.games).where((0, drizzle_orm_1.sql) `${schema_1.games.playerXId} = ${userId} OR ${schema_1.games.playerOId} = ${userId}`);
        const totalGames = userGames.length;
        if (totalGames === 0) {
            return res.json({
                stats: {
                    totalGames: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    winRate: 0,
                },
            });
        }
        // Calculate wins: games where the user is the winner
        const wins = userGames.filter((game) => game.winnerId === userId).length;
        // Calculate draws: games where there's no winner and isWin is false
        const draws = userGames.filter((game) => !game.winner && !game.isWin).length;
        // Losses are total games minus wins and draws
        const losses = totalGames - wins - draws;
        // Debug logging
        console.log(`Stats for user ${username} (${userId}):`, {
            totalGames,
            wins,
            draws,
            losses,
            userGames: userGames.map((g) => ({
                winnerId: g.winnerId,
                playerXId: g.playerXId,
                playerOId: g.playerOId,
                isWin: g.isWin
            }))
        });
        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
        res.json({
            stats: {
                totalGames,
                wins,
                losses,
                draws,
                winRate: Math.round(winRate * 100) / 100,
            },
        });
    }
    catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Serve React app for all non-API routes (SPA support)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path_1.default.join(clientBuildPath, 'index.html'));
    }
    else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 App running on http://localhost:${PORT}`);
    console.log(`📁 Serving client from: ${clientBuildPath}`);
    console.log(`🔗 API available at: http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
