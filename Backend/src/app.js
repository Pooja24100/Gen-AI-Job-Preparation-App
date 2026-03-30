const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Update this to match your frontend URL
    credentials: true, // Allow cookies to be sent with requests
}));
// Require all the routes here
const authRouter = require('./routes/auth.routes');
const interviewRouter = require('./routes/interview.routes');
const profileRouter = require('./routes/profile.routes');

// using all the routes here
app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/profile', profileRouter);

module.exports = app;
