// server.js

// [1] Import necessary modules
const express = require('express'); // Express.js for creating the server
const bodyParser = require('body-parser'); // body-parser to handle request bodies
const fs = require('fs'); // File system module to work with files

const app = express(); // Create an Express application
const port = 3000; // Define the port the server will listen on

// [2] Middleware to parse request bodies
// This middleware will parse incoming requests with URL-encoded and JSON payloads
app.use(bodyParser.urlencoded({ extended: false })); // For parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // For parsing application/json

// [3] Serve static files from the /public directory
// This makes files in the 'public' folder accessible directly from the browser
app.use(express.static('public'));

// --- Signup Endpoint ---
// [4] Handle POST requests to /signup endpoint
app.post('/signup', (req, res) => {
    // Extract email and password from the request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    // User data to be saved
    const newUser = {
        email: email,
        password: password, // In a real application, you should hash the password!
        timestamp: new Date().toISOString() // Add a timestamp for when the user signed up
    };

    const usersFilePath = 'users.json'; // Path to the JSON file storing user data

    // Read existing users from users.json
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        let users = []; // Initialize users array
        if (!err) { // If no error reading the file (file might not exist yet)
            try {
                users = JSON.parse(data); // Try to parse existing user data from JSON
            } catch (parseError) {
                console.error('Error parsing users.json:', parseError);
                // If parsing fails, start with an empty users array
                users = [];
            }
        } else if (err.code !== 'ENOENT') { // If error is not 'File Not Found'
            console.error('Error reading users.json:', err);
            return res.status(500).send('Failed to read user data.');
        }

        // Append the new user to the users array
        users.push(newUser);

        // Write the updated users array back to users.json
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to users.json:', writeErr);
                return res.status(500).send('Signup failed: Could not save user data.');
            }
            console.log(`User signed up: ${email}`);
            res.send('Signup successful!'); // Send success response to the client
        });
    });
});

// --- Login Endpoint ---
// [5] Handle POST requests to /login endpoint
app.post('/login', (req, res) => {
    // Extract email and password from the request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    const usersFilePath = 'users.json'; // Path to the JSON file storing user data

    // Read users from users.json
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(401).send('Login failed: Invalid credentials.'); // User file not found, so no users exist
            } else {
                console.error('Error reading users.json:', err);
                return res.status(500).send('Login failed: Could not read user data.');
            }
        }

        let users = [];
        try {
            users = JSON.parse(data); // Parse user data from JSON
        } catch (parseError) {
            console.error('Error parsing users.json:', parseError);
            return res.status(500).send('Login failed: Could not process user data.');
        }

        // Check if there is a user with the provided email and password
        const userFound = users.find(user => user.email === email && user.password === password); // In real app, compare hashed passwords

        if (userFound) {
            console.log(`User logged in: ${email}`);
            res.send('Login successful!'); // Send success response
        } else {
            console.log(`Login failed for email: ${email}`);
            res.status(401).send('Login failed: Invalid credentials.'); // Send error response if no matching user found
        }
    });
});

// [6] Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`); // Log message when server starts
});
