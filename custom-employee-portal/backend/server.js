require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const seedDatabase = require('./src/models/seed');
const { errorHandler, notFoundHandler } = require('./src/middlewares/errorMiddleware');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const permissionRoutes = require('./src/routes/permissionRoutes');
const auditRoutes = require('./src/routes/auditRoutes');
const zohoRoutes = require('./src/routes/zohoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'BrainWave Custom Employee Portal API',
    version: '1.0.0'
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/zoho', zohoRoutes);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize DB and start server
async function startServer() {
  try {
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 BrainWave Employee Portal Backend Server Running`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🛡️  RBAC & Zoho One OAuth Integration Active`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
