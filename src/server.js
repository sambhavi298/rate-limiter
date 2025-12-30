require('dotenv').config();
const express = require('express');
const checkRouter = require('./routes/check');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Mount the check route
app.use('/check', checkRouter);

// Health check
app.get('/', (req, res) => {
    res.send('Rate Limiter Service is operational');
});

app.listen(port, () => {
    console.log(`Rate Limiter server listening at http://localhost:${port}`);
});
