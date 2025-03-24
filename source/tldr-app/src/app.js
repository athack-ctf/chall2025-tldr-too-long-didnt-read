const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const {Mutex} = require("async-mutex"); // Adjust path as needed

// ---------------------------------------------------------------------------------------------------------------------
// Express App
// ---------------------------------------------------------------------------------------------------------------------

const app = express();
const port = 2025;

// ---------------------------------------------------------------------------------------------------------------------
// Configure Nunjucks
// ---------------------------------------------------------------------------------------------------------------------

const env = nunjucks.configure(path.join(__dirname, 'templates'), {
    autoescape: true,
    express: app,
    // Watch files for changes (useful for development)
    watch: true,
});

// Add a custom filter to the Nunjucks environment
env.addFilter('linkify', function (text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });
});

// ---------------------------------------------------------------------------------------------------------------------
// Middlewares
// ---------------------------------------------------------------------------------------------------------------------

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming JSON request body
app.use(express.json());

// Middleware to manage sessions
app.use(session({
    // Some random secret
    secret: '8ZdH43/3^x$7',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false} // Use true if you're using https
}));

// Middleware for locking a route
// Create a global mutex instance
const globalMutex = new Mutex();

// Global lock middleware
async function globalLockMiddleware(req, res, next) {
    const release = await globalMutex.acquire(); // Acquire the global lock
    res.on('finish', async () => {
        // Delay request execution by 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        release(); // Release the lock when the response finishes
    });
    next(); // Continue processing the request
}

// Apply the global lock middleware for all routes
app.use(globalLockMiddleware);

// ---------------------------------------------------------------------------------------------------------------------
// Data Access
// ---------------------------------------------------------------------------------------------------------------------

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
    return rawThreads.map(rt => {
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
}

// ---------------------------------------------------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------------------------------------------------

app.get('/', (req, res) => {
    res.render('index.twig', {
        isLoggedIn: !!req.session.user,
        user: req.session.user,
        threads: getAllThreads(),
    });
});

app.get('/flag', (req, res) => {
    res.render('flag.twig', {
        isLoggedIn: !!req.session.user,
        user: req.session.user,
    });
});

app.post('/api/login', async (req, res) => {

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Preventing dumb brute forcing attacks
    await sleep(5000);

    const {username, password} = req.body;

    // Validate that username and password are non-empty strings
    if (typeof username !== 'string' || username === '') {
        return res.json({success: false, message: 'Login Failed: Username must be a non-empty string.'});
    }

    if (username.length < 5) {
        return res.json({success: false, message: 'Login Failed: This username is too short!'});
    }

    if (typeof password !== 'string' || password === '') {
        return res.json({success: false, message: 'Login Failed: Password must be a non-empty string.'});
    }

    if (password.length < 16) {
        return res.json({success: false, message: 'Login Failed: This password is too short!'});
    }

    // Find the user by username
    const user = getAllCredentials().find(user => user.username === username);

    const invalidLoginMsg = 'Login Failed: Invalid username or password.';

    if (user === undefined) {
        return res.json({success: false, message: invalidLoginMsg});
    }

    // Constructing username with password
    const usernameWithPassword = `${user.username}${password}`;

    // Check if credentials are valid
    if (await bcrypt.compare(usernameWithPassword, user.password)) {
        // Store session data
        req.session.user = {username: username};
        return res.json({success: true, message: 'Login successful!'});
    }

    return res.json({success: false, message: invalidLoginMsg});
});

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

// ---------------------------------------------------------------------------------------------------------------------
// Start the server
// ---------------------------------------------------------------------------------------------------------------------

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
