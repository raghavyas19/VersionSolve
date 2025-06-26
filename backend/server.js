require('dotenv').config();
const createApp = require('./config/app');
const connectDB = require('./config/db');

const app = createApp();

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});