require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Example route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'WaitLess API is running' });
});

<<<<<<< HEAD
=======

>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
// Patterns route (connects to simulated BestTime.app data)
const patternsRoutes = require('./routes/patterns');
app.use('/api/patterns', patternsRoutes);

<<<<<<< HEAD
=======


// Places Route Import & Setup
const placesRouter = require('./routes/places');
app.use('/api/places', placesRouter);

// Server Start 
 main
>>>>>>> 96ef6ca5a6501699a0c8db7acc71a4ff37839b1e
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

