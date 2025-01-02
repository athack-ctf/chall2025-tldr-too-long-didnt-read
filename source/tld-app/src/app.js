const express = require('express');
const nunjucks = require('nunjucks');
const path = require("path");

const app = express();
const port = 2025;

// Configure Nunjucks
nunjucks.configure(path.join(__dirname, 'templates'), {
    autoescape: true,
    express: app,
    // Watch files for changes (useful for development)
    watch: true,
});

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('index.twig', {title: 'Welcome', message: 'Hello, Nunjucks!'});
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
