const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

app.disable('x-powered-by');
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
});
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
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
