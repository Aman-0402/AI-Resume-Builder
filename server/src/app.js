const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Routes
app.use('/api/auth',    require('./routes/auth.routes'));
app.use('/api/resumes', require('./routes/resume.routes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'AI Resume Builder API is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

module.exports = app;
