const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

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

// Get all saved credentials
const getAllCredentials = () => {
    // Fetching credentials
    const credentialsJson = path.join(__dirname, 'data/credentials.json');
    return JSON.parse(fs.readFileSync(credentialsJson, 'utf8'));
}

const getAllThreads = () => {
    const allCreds = getAllCredentials();
    const threadsJson = path.join(__dirname, 'data/threads.json');
    const rawThreads = JSON.parse(fs.readFileSync(threadsJson, 'utf8'));
    const threads = rawThreads.map(rt => {
        const t = rt;
        t.comments = rt.comments.map(rc => {
            const idx = rc.userIdx;
            const username = allCreds[idx % allCreds.length].username;
            const role = allCreds[idx % allCreds.length].role;
            return {
                username: username,
                role: role,
                text: rc.text,
            }
        })
        return t;
    });

    return threads;
}

// Routes
app.get('/', (req, res) => {
    res.render('index.twig', {
        isLoggedIn: !!req.session.user,
        user: req.session.user,
        threads: getAllThreads(),
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
app.post('/api/login', async (req, res) => {
    const {username, password} = req.body;

    // Validate that username and password are non-empty strings
    if (typeof username !== 'string' || username === '') {
        return res.json({success: false, message: 'Login Failed: Username must be a non-empty string.'});
    }

    if (username.length < 4) {
        return res.json({success: false, message: 'Login Failed: This username is too short!'});
    }

    if (typeof password !== 'string' || password === '') {
        return res.json({success: false, message: 'Login Failed: Password must be a non-empty string.'});
    }

    if (password.length < 12) {
        return res.json({success: false, message: 'Login Failed: This password is too short!'});
    }

    // Find the user by username
    const user = getAllCredentials().find(user => user.username === username);

    // Constructing username with password
    const usernameWithPassword = `${user.username}${password}`;

    // Check if credentials are valid
    if (!user || (await bcrypt.compare(usernameWithPassword, user.password))) {
        // Store session data
        req.session.user = {username: username};
        return res.json({success: true, message: 'Login successful!'});
    }

    return res.json({success: false, message: 'Login Failed: Invalid credentials.'});
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
