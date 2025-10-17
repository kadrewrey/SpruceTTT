# Spruce Tic-Tac-Toe Backend

A Node.js/Express backend with TypeScript, Drizzle ORM, and PostgreSQL for the Spruce Tic-Tac-Toe game.

## Features

- 🔐 User authentication (registration/login) with JWT
- 🎮 Game result storage and statistics
- 📊 User profile and game history
- 🛡️ Secure password hashing with bcrypt
- 🚀 Hot-reload development with nodemon
- 🗄️ PostgreSQL database with Drizzle ORM

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env` file and update with your database URL:
```bash
# .env
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
```

### 3. Database Setup (when ready)
```bash
# Push schema to database
npm run db:push

# Open Drizzle Studio (optional)
npm run db:studio
```

### 4. Start Development Server
```bash
# Basic server (no database required)
npx ts-node src/server-basic.ts

# Full server (requires database)
npm run dev
```

## API Endpoints

### Health & Status
- `GET /health` - Server health check
- `GET /api/status` - API status and features

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Games
- `GET /api/games` - Get user's game history (auth required)
- `POST /api/games` - Save game result (auth required)

### Profile
- `GET /api/profile` - Get user profile and stats (auth required)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);
```

### Games Table
```sql
CREATE TABLE games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES users(id),
  board_size integer NOT NULL,
  is_win boolean NOT NULL,
  moves integer NOT NULL,
  duration integer,
  created_at timestamp DEFAULT now() NOT NULL
);
```

## Development Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

## Current Status

✅ **Completed:**
- Express server setup with TypeScript
- CORS and JSON middleware
- Health check endpoints
- Database schema design
- Authentication routes structure
- Game storage routes structure

⏳ **In Progress:**
- Database connection (requires DATABASE_URL)
- Full authentication implementation
- Game result storage

## Next Steps

1. **Get a PostgreSQL database:**
   - Sign up for [Neon](https://neon.tech) (recommended)
   - Or use any PostgreSQL provider
   - Or run PostgreSQL locally

2. **Update DATABASE_URL:**
   - Copy your database connection string
   - Update `.env` file
   - Format: `postgresql://user:pass@host:port/dbname?sslmode=require`

3. **Initialize database:**
   ```bash
   npm run db:push
   ```

4. **Start full server:**
   ```bash
   npm run dev
   ```

5. **Connect frontend:**
   - Update frontend API base URL to `http://localhost:3001`
   - Add authentication service layer
   - Implement game result saving

## Architecture

```
server/
├── src/
│   ├── server.ts          # Full server with database
│   ├── server-basic.ts    # Basic server for testing
│   ├── schema.ts          # Database schema
│   ├── db.ts              # Database connection
│   └── types.ts           # TypeScript types
├── drizzle/               # Database migrations
├── .env                   # Environment variables
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Technologies

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** JWT + bcrypt
- **Development:** nodemon + ts-node
- **CORS:** Enabled for frontend connection