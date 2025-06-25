require('dotenv').config();
const express = require('express');
const authRouter = require('./routes/auth');
const compilerRouter = require('./routes/compiler');
const problemRouter = require('./routes/problem');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/db');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const aiRouter = require('./routes/ai');
const submissionRouter = require('./routes/submission');

const app = express();

// Load passport configuration
require('./config/passport');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// JWT Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.use('/api/auth', authRouter);
app.use('/api/compiler', compilerRouter); // Compiler route is now public
app.use('/api/problem', problemRouter);
app.use('/api/ai', aiRouter);
app.use('/api/submission', submissionRouter);

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});