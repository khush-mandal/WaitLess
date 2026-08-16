require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectMongoDB } = require('./db/mongo');
const { db } = require('./db');
const { seedDefaultHackathonData, simulateLiveCheckin } = require('./services/demoSimulatorService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize MongoDB Atlas connection
connectMongoDB();

// Initialize SQLite DB schema & seed demo hackathon patterns
seedDefaultHackathonData();

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WaitLess Multi-Source Crowd Intelligence API is running',
    sourcesActive: [
      'MongoDB Atlas User & Personalized Datasets',
      'JWT Authentication & RBAC Engine',
      'Google/OSM Places API',
      'User-Generated Reports DB',
      'AI Review Scraper Agent'
    ]
  });
});

// Import & Connect Routes
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const analyticsRouter = require('./routes/analytics');
const patternsRoutes = require('./routes/patterns');
const placesRouter = require('./routes/places');
const reportsRouter = require('./routes/reports');
const predictionRouter = require('./routes/prediction');

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/patterns', patternsRoutes);
app.use('/api/places', placesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/prediction', predictionRouter);

// 📊 Hackathon Demo Simulator Trigger Endpoint
app.post('/api/demo/trigger-simulate', async (req, res) => {
  const { placeId, placeName } = req.body;
  const result = await simulateLiveCheckin(placeId, placeName);
  res.json({ success: true, message: 'Simulated live user report generated!', data: result });
});

// Background Worker: Periodically simulate ambient check-ins every 5 minutes for vibrant hackathon demo
setInterval(() => {
  simulateLiveCheckin('google_demo_1', 'Central Food Court & Mall');
}, 5 * 60 * 1000);

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 WaitLess Server running on http://localhost:${PORT}`);
});
