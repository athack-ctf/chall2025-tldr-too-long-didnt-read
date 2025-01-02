const express = require('express');
const nunjucks = require('nunjucks');
const path = require("path");
const fs = require("fs");

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

const isLoggedIn = () => {
    // TODO
    return false;
}

// Routes
app.get('/', (req, res) => {
    const threadsJson = path.join(__dirname, 'data/threads.json');
    const threads = JSON.parse(fs.readFileSync(threadsJson, 'utf8'));
    res.render('index.twig', {
        isLoggedIn: isLoggedIn(),
        threads: threads
    });
});

app.get('/flag', (req, res) => {
    res.render('flag.twig', {
        isLoggedIn: isLoggedIn()
    });
});

// 404 Not Found handler for all routes that don't match
app.use((req, res) => {
    // Set 404
    res.status(404).render('404.twig');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
