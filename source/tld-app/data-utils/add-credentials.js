const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require("path");

// Destination
const credentialsJson = path.join(__dirname, '../src/data/credentials.json');

// Load accounts
const accountsJson = path.join(__dirname, 'data/accounts.json');
const accounts = JSON.parse(fs.readFileSync(accountsJson, 'utf8'));

// Function to hash a password
async function hashPasswords(users) {
    const saltRounds = 10; // Number of rounds for bcrypt
    const hashedUsers = [];
    // Loop through users and hash their passwords
    for (let user of users) {
        const usernameWithPassword = `${user.username}${user.password}`;
        const hashedPassword = await bcrypt.hash(usernameWithPassword, saltRounds);
        const userObj = {
            username: user.username,
            password: hashedPassword,
            role: user.role
        };
        hashedUsers.push(userObj);
    }

    return hashedUsers;
}

// Write hashed passwords to a JSON file
async function addCredentials() {
    const hashedUsers = await hashPasswords(accounts);

    // Convert the hashed users list to JSON
    const jsonData = JSON.stringify(hashedUsers, null, 2);

    // Write JSON data to file
    fs.writeFile(credentialsJson, jsonData, (err) => {
        if (err) {
            console.error('Error writing JSON file', err);
        } else {
            console.log('JSON file has been saved!');
        }
    });
}

// Call the function to create the JSON file
addCredentials();
