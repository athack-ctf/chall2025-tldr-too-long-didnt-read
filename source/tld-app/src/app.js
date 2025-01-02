const express = require('express');
const session = require('express-session');
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

// Middleware to parse incoming JSON request body
app.use(express.json());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to manage sessions
app.use(session({
    // Some random secret
    secret: '8ZdH43/3^x$7',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false} // Use true if you're using https
}));

// Routes
app.get('/', (req, res) => {
    const threadsJson = path.join(__dirname, 'data/threads.json');
    const threads = JSON.parse(fs.readFileSync(threadsJson, 'utf8'));
    res.render('index.twig', {
        isLoggedIn: !!req.session.user,
        user: req.session.user,
        threads: threads
    });
});


// Flag
app.get('/flag', (req, res) => {
    res.render('flag.twig', {
        isLoggedIn: !!req.session.user,
        user: req.session.user,
    });
});

// API login route
app.post('/api/login', (req, res) => {
    const {username, password} = req.body;

    // Validate that username and password are non-empty strings
    if (typeof username !== 'string' || username === '') {
        return res.json({success: false, message: 'Username must be a non-empty string.'});
    }

    if (typeof password !== 'string' || password === '') {
        return res.json({success: false, message: 'Password must be a non-empty string.'});
    }

    // FIXME: Replace hardcoded authentication with a bcrypt-based one
    const validUsername = 'admin';
    const validPassword = 'password123';

    // Check if credentials are valid
    if (username === validUsername && password === validPassword) {
        // Store session data
        req.session.user = {username: username};
        return res.json({success: true, message: 'Login successful!'});
    }

    return res.json({success: false, message: 'Invalid credentials.'});
});

// API logout route
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.json({success: false, message: 'Failed to log out.'});
        }
        return res.json({success: true, message: 'Logged out successfully!'});
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
