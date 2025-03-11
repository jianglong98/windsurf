const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// In-memory storage for bookings (replace with database in production)
let bookings = [];

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/services', (req, res) => {
    res.render('services');
});

app.get('/booking', (req, res) => {
    res.render('booking');
});

app.post('/booking', (req, res) => {
    const { name, email, date, time, service } = req.body;
    bookings.push({ name, email, date, time, service });
    res.redirect('/confirmation');
});

app.get('/confirmation', (req, res) => {
    res.render('confirmation');
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
