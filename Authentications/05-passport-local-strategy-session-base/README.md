# 🎯 Complete Beginner-Friendly Guide: Passport Authentication System - Build Order

Based on your Passport authentication project, here's the **exact step-by-step order** to build it from scratch, just like the express-validator guide format.

---

## 📚 OVERVIEW: What We're Building

A **session-based authentication system** with:

- User registration with encrypted passwords
- Login with Passport.js Local Strategy
- Session management stored in MongoDB
- Protected routes (only logged-in users can access)
- Logout functionality
- EJS template views

---

## 1. 📋 PHASE 1: Project Foundation

### Step 1: Create Project Folder & Initialize NPM

```bash
mkdir passport-authentication-app
cd passport-authentication-app
npm init -y
```

**Why first?** Sets up the project structure and creates `package.json`.

**What happens:** Creates a `package.json` file with default settings.

---

### Step 2: Install Dependencies

```bash
npm install express mongoose bcrypt passport passport-local express-session connect-mongo cors ejs dotenv
npm install --save-dev nodemon
```

**Why now?** You need all packages installed before writing any code.

**What each package does:**

- `express` - Web framework for building the server
- `mongoose` - MongoDB object modeling tool (connects to database)
- `bcrypt` - Password hashing library (encrypts passwords)
- `passport` - Authentication middleware
- `passport-local` - Username/password authentication strategy
- `express-session` - Session management middleware
- `connect-mongo` - Store sessions in MongoDB (not server memory)
- `cors` - Enable Cross-Origin Resource Sharing
- `ejs` - Template engine for rendering HTML views
- `dotenv` - Load environment variables from `.env` file
- `nodemon` (dev) - Auto-restart server when files change

---

### Step 3: Update package.json Scripts

Edit `package.json` and add:

```json
{
  "name": "passport-authentication-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "nodemon index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": ""
}
```

**Why now?** You'll use `npm start` to run the server with auto-reload.

---

### Step 4: Create `.env` File (Environment Variables)

Create `.env` in the root folder:

```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/passport-auth-db
SESSION_SECRET=keyboard_cat_super_secret_key_12345
```

**Why now?** Keeps sensitive data separate from code. **NEVER commit `.env` to Git!**

**What each variable does:**

- `PORT` - Server port number
- `MONGO_URL` - MongoDB connection string
- `SESSION_SECRET` - Secret key for encrypting session cookies

---

### Step 5: Create `.gitignore` File

Create `.gitignore` in the root folder:

```
# Ignore node_modules
**/node_modules/

# Ignore environment variables
.env

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
```

**Why now?** Prevents committing large files and sensitive data to Git.

---

## 2. 📁 PHASE 2: Folder Structure Setup

### Step 6: Create Project Folders

```bash
mkdir config models views views/layout
```

**Why now?** Organize code into logical modules following MVC pattern.

**Folder structure:**

```
passport-authentication-app/
├── config/          # Configuration files (database, passport)
├── models/          # Database schemas
├── views/           # EJS template files
│   └── layout/      # Reusable header/footer
├── .env             # Environment variables
├── .gitignore       # Git ignore rules
├── index.js         # Server entry point
├── app.js           # Express app configuration
└── package.json     # Dependencies
```

---

## 3. 🗄️ PHASE 3: Database Layer (Foundation)

### Step 7: Create `models/user.model.js` (User Schema)

```javascript
const mongoose = require('mongoose');

// Define the structure of user documents in MongoDB
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true, // Username must be provided
    unique: true, // No duplicate usernames allowed
  },
  password: {
    type: String,
    required: true, // Password must be provided
  },
});

// Create User model from schema
const User = mongoose.model('User', userSchema);

module.exports = User;
```

**Why now?** Database model is needed before authentication logic.

**What it does:**

- Defines user data structure (username + password)
- `username` must be unique (enforced by MongoDB)
- Both fields are required
- Creates a "users" collection in MongoDB (Mongoose auto-pluralizes "User" → "users")

---

### Step 8: Create `config/database.js` (Database Connection)

```javascript
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB database
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Server is connected with MongoDB database');
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1); // Exit if connection fails
  });
```

**Why now?** Database connection must be established early so other modules can use it.

**What it does:**

- Loads `.env` file to get MongoDB URL
- Connects to MongoDB using Mongoose
- Logs success message if connected
- Exits process if connection fails (prevents running without database)

**Flow:**

1. Reads `MONGO_URL` from `.env`
2. Attempts connection
3. Success → logs message
4. Failure → logs error and exits

---

## 4. 🔐 PHASE 4: Authentication Layer (Security Core)

### Step 9: Create `config/passport.js` (Passport Configuration)

This is the **heart of authentication**. Read carefully!

```javascript
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user.model');

// ============================================
// PART A: LOCAL STRATEGY (Login Logic)
// ============================================
// This tells Passport: "Here's how to verify username and password"
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Step 1: Find user in database by username
      const user = await User.findOne({ username: username });

      // Step 2: Check if user exists
      if (!user) {
        return done(null, false, { message: 'Incorrect Username' });
      }

      // Step 3: Compare entered password with hashed password in database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return done(null, false, { message: 'Incorrect password' });
      }

      // Step 4: If both username and password are correct, return user object
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

// ============================================
// PART B: SERIALIZE USER (Save to Session)
// ============================================
// This tells Passport: "After login, save only user ID in session"
// Runs ONCE when user logs in successfully
passport.serializeUser((user, done) => {
  done(null, user.id); // Save only ID (keeps session small and fast)
});

// ============================================
// PART C: DESERIALIZE USER (Load from Session)
// ============================================
// This tells Passport: "On every request, use stored ID to get full user"
// Runs on EVERY request to populate req.user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Fetch user from database
    done(null, user); // Attach user object to req.user
  } catch (error) {
    done(error, false);
  }
});
```

**Why now?** Routes need this authentication logic, so create it before `app.js`.

**What each part does:**

**PART A - Local Strategy (Login Verification):**

1. Receives username and password from login form
2. Searches database for user with that username
3. If user not found → login fails
4. If user found → compares password using bcrypt
5. If password matches → returns user object (login success)
6. If password doesn't match → login fails

**PART B - Serialize User (Store in Session):**

- After successful login, saves **only user ID** in session
- Why only ID? Keeps session data small and efficient
- Session stored in MongoDB, not server memory

**PART C - Deserialize User (Retrieve from Session):**

- On **every request**, reads user ID from session
- Fetches full user object from database
- Attaches user to `req.user` (available in all routes)
- This is how `req.isAuthenticated()` works!

**Security Flow:**

```
Login → Verify Password → Store User ID → On Each Request → Fetch User → Check Auth
```

---

## 5. 🎨 PHASE 5: View Layer (User Interface)

### Step 10: Create `views/layout/header.ejs` (Reusable Header)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Passport Authentication</title>
  </head>
  <body>
    <header>
      <nav>
        <a href="/">Home</a>
        <a href="/register">Register</a>
        <a href="/login">Login</a>
        <a href="/profile">Profile</a>
        <a href="/logout">Logout</a>
      </nav>
    </header>
  </body>
</html>
```

**Why now?** All pages will include this header for consistent navigation.

**What it does:**

- Creates HTML structure and navigation menu
- Links to all main pages
- Will be included in every page using `<%- include('layout/header') %>`

---

### Step 11: Create `views/layout/footer.ejs` (Reusable Footer)

```html
<footer>
  <p>Copyright by Your Name</p>
</footer>
</body>
</html>
```

**Why now?** Closes HTML tags opened in header.

---

### Step 12: Create `views/index.ejs` (Home Page)

```html
<%- include('layout/header') %>
<main>
  <h1>Welcome to Home Page</h1>
  <p>This is a Passport.js authentication demo.</p>
</main>
<%- include('layout/footer') %>
```

**Why now?** Need a landing page for users.

**What it does:**

- Includes header (navigation)
- Shows welcome message
- Includes footer

---

### Step 13: Create `views/register.ejs` (Registration Form)

```html
<%- include('layout/header') %>
<main>
  <h1>Register Page</h1>
  <form action="/register" method="post">
    <div>
      <label for="username">Username: </label>
      <input type="text" id="username" name="username" required />
    </div>
    <br />
    <div>
      <label for="password">Password: </label>
      <input type="password" id="password" name="password" required />
    </div>
    <br />
    <button type="submit">Register</button>
  </form>
</main>
<%- include('layout/footer') %>
```

**Why now?** Users need a way to create accounts.

**What it does:**

- Form submits to `POST /register` route
- Collects username and password
- `method="post"` sends data securely (not in URL)
- `name` attributes match what backend expects

---

### Step 14: Create `views/login.ejs` (Login Form)

```html
<%- include('layout/header') %>
<main>
  <h1>Login Page</h1>
  <form action="/login" method="post">
    <div>
      <label for="username">Username: </label>
      <input type="text" id="username" name="username" required />
    </div>
    <br />
    <div>
      <label for="password">Password: </label>
      <input type="password" id="password" name="password" required />
    </div>
    <br />
    <button type="submit">Login</button>
  </form>
</main>
<%- include('layout/footer') %>
```

**Why now?** Users need a way to log in.

**What it does:**

- Form submits to `POST /login` route
- Passport will intercept and verify credentials
- `name` attributes must be "username" and "password" (Passport default)

---

### Step 15: Create `views/profile.ejs` (Protected Page)

```html
<%- include('layout/header') %>
<main>
  <h1>Profile Page</h1>
  <p>Welcome! You are logged in.</p>
</main>
<%- include('layout/footer') %>
```

**Why now?** Need a protected page only logged-in users can see.

**What it does:**

- Shows user profile (only accessible when authenticated)
- In real app, would display user data from `req.user`

---

## 6. 🚀 PHASE 6: Application Layer (Main Logic)

### Step 16: Create `app.js` (Express Application Configuration)

This is the **main application file** where everything connects!

```javascript
// ============================================
// DEPENDENCIES & IMPORTS
// ============================================
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
const MongoStore = require('connect-mongo');
require('dotenv').config();

// Database connection (establishes connection immediately)
require('./config/database');

// Passport configuration (sets up authentication strategies)
require('./config/passport');

// User model
const User = require('./models/user.model');

const app = express();
const saltRounds = 10; // Bcrypt salt rounds (higher = more secure but slower)

// ============================================
// VIEW ENGINE SETUP
// ============================================
// Set EJS as template engine to render .ejs files into HTML
app.set('view engine', 'ejs');

// ============================================
// MIDDLEWARE SETUP (Order matters!)
// ============================================
app.use(cors()); // Enable CORS for all routes
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json()); // Parse JSON data

// ============================================
// SESSION SETUP (Must come before Passport)
// ============================================
// Creates a session storage system that remembers logged-in users
app.set('trust proxy', 1); // Trust first proxy (needed for some hosting)
app.use(
  session({
    secret: 'keyboard cat', // Encrypts session cookie (use process.env.SESSION_SECRET in production!)
    resave: false, // Don't save session if nothing changed
    saveUninitialized: true, // Save new sessions even if empty
    store: MongoStore.create({
      // Store sessions in MongoDB (persists across server restarts)
      mongoUrl: process.env.MONGO_URL,
      collectionName: 'sessions', // Collection name in MongoDB
    }),
    // cookie: { secure: true },      // Enable in production with HTTPS
  }),
);

// ============================================
// PASSPORT SETUP (Must come after session)
// ============================================
// Initializes Passport and connects it to session system
app.use(passport.initialize()); // Start Passport
app.use(passport.session()); // Enable persistent login sessions

// ============================================
// CUSTOM MIDDLEWARE FUNCTIONS
// ============================================

// MIDDLEWARE 1: Prevent logged-in users from accessing login/register pages
const checkLoggedIn = (request, response, next) => {
  if (request.isAuthenticated()) {
    return response.redirect('/profile'); // Already logged in? Go to profile
  }
  next(); // Not logged in? Continue to login/register page
};

// MIDDLEWARE 2: Protect routes - only authenticated users can access
const checkAuthenticated = (request, response, next) => {
  if (request.isAuthenticated()) {
    return next(); // Logged in? Continue to route
  }
  response.redirect('/login'); // Not logged in? Go to login page
};

// ============================================
// ROUTES
// ============================================

// Home route (accessible to everyone)
app.get('/', (request, response) => {
  response.render('index');
});

// Show registration form
app.get('/register', (request, response) => {
  response.render('register');
});

// Handle user registration
app.post('/register', async (request, response) => {
  try {
    // Step 1: Check if username already exists
    const user = await User.findOne({ username: request.body.username });
    if (user) {
      return response.status(400).send('User already exists');
    }

    // Step 2: Hash password with bcrypt (saltRounds = 10)
    bcrypt.hash(request.body.password, saltRounds, async (err, hash) => {
      if (err) {
        return response.status(500).send('Error hashing password');
      }

      // Step 3: Create new user with hashed password
      const newUser = new User({
        username: request.body.username,
        password: hash, // NEVER store plain text password!
      });

      // Step 4: Save to database
      await newUser.save();

      // Step 5: Redirect to login page
      response.redirect('/login');
    });
  } catch (error) {
    response.status(500).send(error.message);
  }
});

// Show login form (redirect to profile if already logged in)
app.get('/login', checkLoggedIn, (request, response) => {
  response.render('login');
});

// Handle user login (Passport handles authentication)
app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login', // If login fails, back to login page
    successRedirect: '/profile', // If login succeeds, go to profile
  }),
);

// User profile page (only accessible when logged in)
app.get('/profile', checkAuthenticated, (request, response) => {
  response.render('profile');
  // In real app: response.render('profile', { user: request.user });
});

// Handle user logout
app.get('/logout', (request, response) => {
  try {
    request.logout((error) => {
      // Passport provides this method
      if (error) {
        return response.status(500).send('Logout error');
      }
      response.redirect('/'); // Redirect to home page
    });
  } catch (error) {
    response.status(500).send(error.message);
  }
});

module.exports = app;
```

**Why now?** This is the core application that ties everything together.

**What each section does:**

**1. Dependencies & Imports:**

- Loads all required packages
- Imports database connection (connects to MongoDB)
- Imports Passport configuration (sets up authentication)
- Imports User model

**2. View Engine Setup:**

- Tells Express to use EJS for rendering HTML

**3. Middleware Setup (ORDER MATTERS!):**

- `cors()` - Allows cross-origin requests
- `express.urlencoded()` - Parses form data (username, password)
- `express.json()` - Parses JSON data

**4. Session Setup:**

- Creates session system using `express-session`
- Stores sessions in MongoDB (not server memory)
- Why MongoDB? Server restart won't log everyone out!
- Secret encrypts session cookies (prevents tampering)

**5. Passport Setup:**

- `passport.initialize()` - Starts Passport
- `passport.session()` - Connects Passport to sessions
- Now `req.user` will be available on every request!

**6. Custom Middleware:**

- `checkLoggedIn` - Redirects logged-in users away from login/register
- `checkAuthenticated` - Protects routes, only authenticated users can access

**7. Routes:**

- `GET /` - Home page (everyone can access)
- `GET /register` - Show registration form
- `POST /register` - Create new user (hashes password!)
- `GET /login` - Show login form (with `checkLoggedIn`)
- `POST /login` - Authenticate user (Passport handles it)
- `GET /profile` - Protected page (with `checkAuthenticated`)
- `GET /logout` - Log out user and redirect

**Registration Flow:**

```
User submits form → Check username exists → Hash password → Save to DB → Redirect to login
```

**Login Flow:**

```
User submits form → Passport runs Local Strategy → Verify credentials → Create session → Redirect to profile
```

**Protected Route Flow:**

```
User visits /profile → checkAuthenticated runs → Is authenticated? → Yes: show profile, No: redirect to login
```

---

### Step 17: Create `index.js` (Server Entry Point)

```javascript
require('dotenv').config(); // Load environment variables first!
const app = require('./app'); // Import Express app

const port = process.env.PORT || 5000; // Get port from .env or use 5000

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

**Why last?** This is the final entry point that starts everything.

**What it does:**

1. Loads `.env` file (environment variables)
2. Imports the Express app from `app.js`
3. Gets port number from `.env` (or defaults to 5000)
4. Starts the server and listens for requests
5. Logs message when server is ready

**Execution Order When You Run `npm start`:**

```
1. index.js runs
2. Loads .env file
3. Imports app.js
   ↓
4. app.js runs
5. Requires config/database.js → Connects to MongoDB
6. Requires config/passport.js → Sets up authentication strategies
7. Sets up middleware (sessions, Passport, etc.)
8. Defines routes
9. Returns app to index.js
   ↓
10. index.js starts server on port 5000
11. Server ready! Listening for requests
```

---
