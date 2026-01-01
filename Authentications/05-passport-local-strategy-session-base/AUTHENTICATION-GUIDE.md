# 🔐 Complete Beginner's Guide to Authentication

**Welcome!** If this is your first time working with authentication, you're in the right place. This guide will explain **everything** step-by-step in simple terms.

---

## 📚 Table of Contents

1. [What is Authentication?](#what-is-authentication)
2. [How Does This Project Work?](#how-does-this-project-work)
3. [Key Concepts Explained](#key-concepts-explained)
4. [Step-by-Step Code Walkthrough](#step-by-step-code-walkthrough)
5. [The Complete User Journey](#the-complete-user-journey)
6. [Security Explained](#security-explained)
7. [Testing the Application](#testing-the-application)
8. [Common Questions](#common-questions)

---

## 🤔 What is Authentication?

### The Problem

Imagine a website where anyone can access anyone else's profile. That's not secure! We need a way to:

1. **Verify who you are** (authentication)
2. **Remember who you are** across multiple page visits (sessions)
3. **Protect certain pages** so only logged-in users can see them

### The Solution

**Authentication** is the process of verifying that you are who you claim to be. Think of it like showing an ID card:

- **Registration** = Getting an ID card
- **Login** = Showing your ID card
- **Session** = The venue remembers you, so you don't need to show ID again
- **Logout** = Telling the venue to forget you

---

## 🏗️ How Does This Project Work?

This project uses **session-based authentication** with several technologies:

### The Stack

```
┌─────────────────────────────────────────────┐
│  User Interface (EJS Templates)             │
│  - Registration form                        │
│  - Login form                               │
│  - Profile page                             │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Express.js Server (app.js)                 │
│  - Handles requests                         │
│  - Processes forms                          │
│  - Protects routes                          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Passport.js (config/passport.js)           │
│  - Verifies username & password             │
│  - Manages login/logout                     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Sessions (MongoDB + express-session)       │
│  - Remembers logged-in users                │
│  - Stores session data                      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Database (MongoDB + Mongoose)              │
│  - Stores user accounts                     │
│  - Stores session data                      │
└─────────────────────────────────────────────┘
```

### How They Work Together

1. **User fills out form** → Browser sends data to Express server
2. **Express receives data** → Passes to Passport for verification
3. **Passport checks credentials** → Queries MongoDB database
4. **If valid** → Creates session in MongoDB, sends cookie to browser
5. **On next request** → Browser sends cookie, server recognizes user

---

## 🧠 Key Concepts Explained

### 1. Password Hashing (Bcrypt)

**Problem:** If we store passwords as plain text, hackers can read them!

```javascript
// ❌ BAD - Never do this!
password: "myPassword123"

// ✅ GOOD - Hashed password
password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgWPEyVPvLj5pN8dQeJhKLH3LNhq"
```

**How bcrypt works:**

```
User enters: "myPassword123"
                  ↓
Bcrypt adds random "salt": "myPassword123" + "x7k9mQ2p"
                  ↓
Hashes 1024 times (slow on purpose!)
                  ↓
Final hash: "$2b$10$N9qo8uLOick..."
                  ↓
Stored in database
```

**Why it's secure:**
- **One-way function** - Can't reverse the hash to get original password
- **Unique salt** - Same password = different hash each time
- **Slow hashing** - Takes ~100ms (prevents brute force attacks)
- **Even if database is hacked** - Passwords are safe!

**How login works with hashing:**

```javascript
// User tries to log in with: "myPassword123"

// 1. Get hashed password from database
const dbPassword = "$2b$10$N9qo8uLOick...";

// 2. Hash the entered password and compare
bcrypt.compare("myPassword123", dbPassword)
// Returns: true (passwords match!)

// 3. If true → login success
// 4. If false → login failed
```

---

### 2. Sessions & Cookies

**Problem:** HTTP is stateless - the server forgets you after each request!

**Solution:** Sessions remember who you are.

#### What is a Session?

A **session** is like a locker at a gym:

1. You log in → Server creates a locker (session) with your stuff (user data)
2. Server gives you a key (session ID in a cookie)
3. You make another request → You show the key
4. Server opens your locker → Retrieves your data

#### Cookie (Stored in Browser)

```
connect.sid=s%3A7k9mQ2p.encrypted_data_here
```

- Just an encrypted ID number
- Sent automatically with every request
- Cannot be tampered with (server detects changes)

#### Session (Stored in MongoDB)

```json
{
  "_id": "7k9mQ2p",
  "expires": "2025-12-31T23:59:59.000Z",
  "session": {
    "cookie": {
      "maxAge": 86400000
    },
    "passport": {
      "user": "user_id_12345"  ← This is the important part!
    }
  }
}
```

- Contains your user ID
- Server-side storage (secure)
- Linked to cookie by ID

#### Session Flow

```
1. You log in successfully
   ↓
2. Server creates session:
   {
     passport: { user: "your_user_id" }
   }
   ↓
3. Server stores session in MongoDB
   ↓
4. Server sends cookie to browser:
   Set-Cookie: connect.sid=7k9mQ2p
   ↓
5. Browser saves cookie
   ↓
6. Every request includes cookie:
   Cookie: connect.sid=7k9mQ2p
   ↓
7. Server reads cookie → Finds session → Loads your data
   ↓
8. You're recognized as logged in!
```

---

### 3. Passport.js

**Passport.js** is an authentication middleware that handles all the login/logout logic.

#### What Passport Does

1. **Verifies credentials** - Checks if username/password are correct
2. **Manages sessions** - Saves user to session after login
3. **Provides helpers** - `req.user`, `req.isAuthenticated()`, `req.login()`, `req.logout()`

#### The Three Main Functions

**A) Local Strategy** - "How to verify username & password"

```javascript
passport.use(new LocalStrategy(async (username, password, done) => {
  // 1. Find user in database
  const user = await User.findOne({ username: username });

  // 2. User doesn't exist?
  if (!user) {
    return done(null, false, { message: 'User not found' });
  }

  // 3. Check password with bcrypt
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return done(null, false, { message: 'Wrong password' });
  }

  // 4. Everything correct!
  return done(null, user);
}));
```

**When does this run?** Only during login when user submits the login form.

---

**B) Serialize User** - "What to save in session"

```javascript
passport.serializeUser((user, done) => {
  done(null, user.id); // Save only user ID
});
```

**Why only save ID?**
- Sessions are accessed on **every request**
- Storing full user object = slow and uses lots of memory
- Storing only ID = fast and lightweight
- We can fetch full user data when needed

**When does this run?** Once after successful login.

---

**C) Deserialize User** - "How to load user on each request"

```javascript
passport.deserializeUser(async (id, done) => {
  // Use ID from session to fetch full user
  const user = await User.findById(id);
  done(null, user); // Attach to req.user
});
```

**When does this run?** On **every request** where user is logged in.

**What it does:**
- Reads user ID from session
- Fetches full user object from database
- Attaches to `req.user` (available in all routes)

---

### 4. Middleware

**Middleware** are functions that run **before** your route handlers.

Think of middleware as security guards at a concert:

```
You → Guard 1 (ticket check) → Guard 2 (ID check) → Concert entrance
     [Middleware 1]           [Middleware 2]        [Route Handler]
```

#### Example: Authentication Middleware

```javascript
const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // ✅ Logged in - let them through
  }
  res.redirect('/login'); // ❌ Not logged in - redirect to login
};

// Use middleware to protect route
app.get('/profile', checkAuthenticated, (req, res) => {
  res.render('profile');
});
```

**Flow:**

```
1. User visits /profile
   ↓
2. checkAuthenticated runs first
   ↓
3. Is user logged in?
   ├─ YES → call next() → show profile
   └─ NO  → redirect to /login
```

---

## 📝 Step-by-Step Code Walkthrough

### File 1: `models/user.model.js`

**Purpose:** Defines what user data looks like in the database.

```javascript
const mongoose = require('mongoose');

// Create a schema (blueprint) for user documents
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,   // Must provide username
    unique: true,     // No duplicate usernames
  },
  password: {
    type: String,
    required: true,   // Must provide password
  },
});

// Create model from schema
const User = mongoose.model('User', userSchema);

module.exports = User;
```

**What this creates in MongoDB:**

```json
// Collection: users
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "johndoe",
  "password": "$2b$10$N9qo8uLOick...",
  "__v": 0
}
```

---

### File 2: `config/database.js`

**Purpose:** Connect to MongoDB database.

```javascript
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.log('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Stop server if no database
  });
```

**What happens:**

```
1. Reads MONGO_URL from .env file
   Example: mongodb://localhost:27017/passport-auth-db

2. Attempts to connect to MongoDB

3. Success?
   ├─ YES → Log success message
   └─ NO  → Log error and exit
```

---

### File 3: `config/passport.js`

**Purpose:** Configure Passport authentication strategies.

#### Part A: Local Strategy (Login Verification)

```javascript
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // STEP 1: Find user by username
      const user = await User.findOne({ username: username });

      // STEP 2: User not found?
      if (!user) {
        return done(null, false, { message: 'Incorrect Username' });
      }

      // STEP 3: Compare passwords
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return done(null, false, { message: 'Incorrect password' });
      }

      // STEP 4: Everything valid!
      return done(null, user);

    } catch (error) {
      return done(error);
    }
  })
);
```

**Login Flow:**

```
User submits: { username: "johndoe", password: "password123" }
                           ↓
Step 1: Search database for username "johndoe"
                           ↓
Found user? → YES
                           ↓
Step 2: Get hashed password from database
        "$2b$10$N9qo8uLOick..."
                           ↓
Step 3: Compare passwords with bcrypt
        bcrypt.compare("password123", "$2b$10$N9qo8uLOick...")
                           ↓
Match? → YES
                           ↓
Step 4: Return user object
        done(null, user)
                           ↓
Login successful! ✅
```

---

#### Part B: Serialize User (Save to Session)

```javascript
passport.serializeUser((user, done) => {
  done(null, user.id); // Save only user ID
});
```

**What happens after successful login:**

```
User object: {
  _id: "507f1f77bcf86cd799439011",
  username: "johndoe",
  password: "$2b$10$..."
}
           ↓
serializeUser extracts: "507f1f77bcf86cd799439011"
           ↓
Saves to session in MongoDB:
{
  passport: {
    user: "507f1f77bcf86cd799439011"  ← Only the ID!
  }
}
```

**Why only ID?**
- Full user object = lots of data
- ID = tiny string
- Session accessed on every request
- Lightweight = faster performance

---

#### Part C: Deserialize User (Load from Session)

```javascript
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // Attach to req.user
  } catch (error) {
    done(error, false);
  }
});
```

**What happens on EVERY request:**

```
1. User visits any page (e.g., /profile)
   ↓
2. Browser sends cookie: connect.sid=7k9mQ2p
   ↓
3. express-session finds session in MongoDB
   Session data: { passport: { user: "507f1f77..." } }
   ↓
4. deserializeUser runs with ID: "507f1f77..."
   ↓
5. Query database: User.findById("507f1f77...")
   ↓
6. Attach full user object to req.user
   req.user = {
     _id: "507f1f77...",
     username: "johndoe",
     password: "$2b$10$..."
   }
   ↓
7. Now all routes have access to req.user!
```

---

### File 4: `app.js` (Main Application)

This is where everything comes together!

#### Part 1: Dependencies & Setup

```javascript
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
const MongoStore = require('connect-mongo');
require('dotenv').config();

// Connect to database (runs immediately)
require('./config/database');

// Configure Passport strategies (runs immediately)
require('./config/passport');

// Import User model
const User = require('./models/user.model');

const app = express();
const saltRounds = 10; // Bcrypt complexity
```

**What happens:**
1. Import all required packages
2. Load environment variables from `.env`
3. Connect to MongoDB (database.js runs)
4. Set up Passport strategies (passport.js runs)
5. Import User model for database operations
6. Create Express app instance
7. Set bcrypt salt rounds (higher = more secure but slower)

---

#### Part 2: View Engine

```javascript
app.set('view engine', 'ejs');
```

**What this does:** Tells Express to use EJS for rendering HTML.

When you write:
```javascript
res.render('login');
```

Express looks for: `views/login.ejs` and converts it to HTML.

---

#### Part 3: Middleware (ORDER MATTERS!)

```javascript
// 1. Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2. Enable CORS
app.use(cors());

// 3. Session setup
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: 'sessions',
    }),
  })
);

// 4. Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
```

**Why this order?**

```
Request comes in
       ↓
1. Parse form data (username, password)
       ↓
2. Enable CORS (allow cross-origin requests)
       ↓
3. Load/create session (read cookie, fetch from MongoDB)
       ↓
4. Initialize Passport (prepare authentication)
       ↓
5. Connect Passport to session (load user from session)
       ↓
Route handler executes
```

**Session Configuration Explained:**

```javascript
session({
  secret: 'keyboard cat',        // Encrypts cookie (prevents tampering)
  resave: false,                 // Don't save if nothing changed
  saveUninitialized: true,       // Save new empty sessions
  store: MongoStore.create({     // Where to store sessions
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'sessions',  // MongoDB collection name
  }),
})
```

---

#### Part 4: Custom Middleware

**Middleware 1: Prevent Already Logged-In Users from Seeing Login Page**

```javascript
const checkLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // Already logged in? Go to profile instead
    return res.redirect('/profile');
  }
  // Not logged in? Show login page
  next();
};
```

**Usage:**
```javascript
app.get('/login', checkLoggedIn, (req, res) => {
  res.render('login');
});
```

**Flow:**
```
User visits /login
       ↓
checkLoggedIn runs
       ↓
Already logged in?
├─ YES → Redirect to /profile (why login again?)
└─ NO  → Show login page
```

---

**Middleware 2: Protect Routes (Only Allow Logged-In Users)**

```javascript
const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // Logged in? Continue to route
    return next();
  }
  // Not logged in? Redirect to login
  res.redirect('/login');
};
```

**Usage:**
```javascript
app.get('/profile', checkAuthenticated, (req, res) => {
  res.render('profile');
});
```

**Flow:**
```
User visits /profile
       ↓
checkAuthenticated runs
       ↓
Logged in?
├─ YES → Show profile page
└─ NO  → Redirect to /login
```

---

#### Part 5: Routes

**Route 1: Home Page (Public)**

```javascript
app.get('/', (req, res) => {
  res.render('index');
});
```

No authentication needed - anyone can visit home page.

---

**Route 2: Show Registration Form**

```javascript
app.get('/register', (req, res) => {
  res.render('register');
});
```

Shows the registration form (username + password fields).

---

**Route 3: Handle Registration Submission**

```javascript
app.post('/register', async (req, res) => {
  try {
    // STEP 1: Check if username already exists
    const user = await User.findOne({ username: req.body.username });

    if (user) {
      return res.status(400).send('User already exists');
    }

    // STEP 2: Hash password with bcrypt
    bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
      if (err) {
        return res.status(500).send('Error hashing password');
      }

      // STEP 3: Create new user with hashed password
      const newUser = new User({
        username: req.body.username,
        password: hash, // ← NEVER store plain text!
      });

      // STEP 4: Save to database
      await newUser.save();

      // STEP 5: Redirect to login
      res.redirect('/login');
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
});
```

**Registration Flow:**

```
User submits form:
{ username: "johndoe", password: "password123" }
                    ↓
Step 1: Check if "johndoe" already exists
        User.findOne({ username: "johndoe" })
                    ↓
Already exists? → NO (good!)
                    ↓
Step 2: Hash password "password123"
        bcrypt.hash("password123", 10)
        Result: "$2b$10$N9qo8uLOick..."
                    ↓
Step 3: Create user object
        {
          username: "johndoe",
          password: "$2b$10$N9qo8uLOick..."
        }
                    ↓
Step 4: Save to MongoDB "users" collection
                    ↓
Step 5: Redirect to /login
                    ↓
User can now log in! ✅
```

---

**Route 4: Show Login Form**

```javascript
app.get('/login', checkLoggedIn, (req, res) => {
  res.render('login');
});
```

- Uses `checkLoggedIn` middleware
- If already logged in → redirects to profile
- If not logged in → shows login form

---

**Route 5: Handle Login Submission**

```javascript
app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',    // Wrong credentials? Back to login
    successRedirect: '/profile',  // Correct? Go to profile
  })
);
```

**What `passport.authenticate()` does:**

```
1. Receives form data: { username, password }
   ↓
2. Calls Local Strategy (config/passport.js)
   ↓
3. Local Strategy verifies credentials
   ↓
4. Success?
   ├─ YES → serializeUser runs
   │        Session created in MongoDB
   │        Cookie sent to browser
   │        Redirect to /profile ✅
   │
   └─ NO  → Redirect to /login ❌
```

---

**Route 6: Profile Page (Protected)**

```javascript
app.get('/profile', checkAuthenticated, (req, res) => {
  res.render('profile');
  // Can access user data: req.user
});
```

**Protected Route Flow:**

```
User visits /profile
       ↓
Browser sends cookie: connect.sid=7k9mQ2p
       ↓
express-session finds session in MongoDB
       ↓
deserializeUser runs
       ↓
Fetches user from database
       ↓
Attaches to req.user
       ↓
checkAuthenticated middleware runs
       ↓
req.isAuthenticated() checks if req.user exists
       ↓
Exists?
├─ YES → Show profile page ✅
└─ NO  → Redirect to /login ❌
```

---

**Route 7: Logout**

```javascript
app.get('/logout', (req, res) => {
  try {
    req.logout((error) => {
      if (error) {
        return res.status(500).send('Logout error');
      }
      res.redirect('/');
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
```

**Logout Flow:**

```
User visits /logout
       ↓
req.logout() runs (Passport method)
       ↓
Removes user from session
       ↓
Updates session in MongoDB:
  Before: { passport: { user: "507f1f77..." } }
  After:  { }
       ↓
Session still exists, but no user data
       ↓
Redirect to home page
       ↓
User is no longer authenticated! ✅
```

---

### File 5: `index.js` (Entry Point)

```javascript
require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

**Startup Sequence:**

```
1. Run: npm start
   ↓
2. nodemon executes index.js
   ↓
3. Load .env file (environment variables)
   ↓
4. Import app from app.js
   ├─ Connects to MongoDB (config/database.js)
   ├─ Sets up Passport (config/passport.js)
   ├─ Configures middleware
   └─ Defines routes
   ↓
5. Start server on port 5000
   ↓
6. Server ready! 🚀
```

---

## 🚶 The Complete User Journey

### Journey 1: Registration

**Step-by-Step:**

```
┌─────────────────────────────────────────────────────┐
│ 1. User opens browser                               │
│    → Visits http://localhost:5000/register          │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 2. Express receives GET /register                   │
│    → Executes route handler                         │
│    → res.render('register')                         │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 3. Browser displays registration form               │
│    [Username: _______]                              │
│    [Password: _______]                              │
│    [Register Button]                                │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 4. User fills form                                  │
│    Username: johndoe                                │
│    Password: password123                            │
│    → Clicks "Register"                              │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 5. Browser sends POST /register                     │
│    Body: {                                          │
│      username: "johndoe",                           │
│      password: "password123"                        │
│    }                                                │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 6. Express receives POST /register                  │
│    → express.urlencoded() parses form data          │
│    → Route handler executes                         │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 7. Check if username exists                         │
│    → User.findOne({ username: "johndoe" })          │
│    → MongoDB query: db.users.findOne(...)           │
│    → Result: null (doesn't exist - good!)           │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 8. Hash password with bcrypt                        │
│    Input: "password123"                             │
│    → bcrypt.hash("password123", 10)                 │
│    → Runs hashing algorithm 1024 times              │
│    Output: "$2b$10$N9qo8uLOick..."                  │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 9. Create user document                             │
│    {                                                │
│      username: "johndoe",                           │
│      password: "$2b$10$N9qo8uLOick..."              │
│    }                                                │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 10. Save to MongoDB                                 │
│     → newUser.save()                                │
│     → Inserted into "users" collection              │
│     → Auto-generates _id: ObjectId("507f1f77...")   │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 11. Redirect to login page                          │
│     → res.redirect('/login')                        │
│     → Browser navigates to /login                   │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 12. Registration complete! ✅                        │
│     User can now log in                             │
└─────────────────────────────────────────────────────┘
```

---

### Journey 2: Login

**Step-by-Step:**

```
┌─────────────────────────────────────────────────────┐
│ 1. User visits http://localhost:5000/login          │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 2. Express receives GET /login                      │
│    → checkLoggedIn middleware runs                  │
│    → req.isAuthenticated() → false (not logged in)  │
│    → next() (continue to route)                     │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 3. Show login form                                  │
│    [Username: _______]                              │
│    [Password: _______]                              │
│    [Login Button]                                   │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 4. User fills form                                  │
│    Username: johndoe                                │
│    Password: password123                            │
│    → Clicks "Login"                                 │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 5. Browser sends POST /login                        │
│    Body: {                                          │
│      username: "johndoe",                           │
│      password: "password123"                        │
│    }                                                │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 6. passport.authenticate('local') intercepts        │
│    → Calls Local Strategy                           │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 7. Local Strategy: Find user                        │
│    → User.findOne({ username: "johndoe" })          │
│    → MongoDB returns user document                  │
│    {                                                │
│      _id: ObjectId("507f1f77..."),                  │
│      username: "johndoe",                           │
│      password: "$2b$10$N9qo8uLOick..."              │
│    }                                                │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 8. Local Strategy: Verify password                  │
│    → bcrypt.compare("password123", "$2b$10$N9qo...")│
│    → Hashes entered password and compares           │
│    → Result: true (passwords match!) ✅             │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 9. Local Strategy: Return user                      │
│    → done(null, user)                               │
│    → Authentication successful!                     │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 10. passport.serializeUser runs                     │
│     → Input: user object                            │
│     → Extract: user.id = "507f1f77..."              │
│     → done(null, "507f1f77...")                     │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 11. Create session in MongoDB                       │
│     Insert into "sessions" collection:              │
│     {                                               │
│       _id: "7k9mQ2p",                               │
│       expires: ISODate("2025-12-31..."),            │
│       session: {                                    │
│         cookie: { maxAge: 86400000 },               │
│         passport: {                                 │
│           user: "507f1f77..."  ← User ID saved!     │
│         }                                           │
│       }                                             │
│     }                                               │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 12. Send session cookie to browser                  │
│     Set-Cookie: connect.sid=s%3A7k9mQ2p...          │
│     → Browser saves cookie                          │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 13. Redirect to /profile                            │
│     → res.redirect('/profile')                      │
│     → Browser navigates to /profile                 │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 14. Login complete! ✅                               │
│     User is now authenticated                       │
└─────────────────────────────────────────────────────┘
```

---

### Journey 3: Accessing Protected Route

**Step-by-Step:**

```
┌─────────────────────────────────────────────────────┐
│ 1. Logged-in user visits /profile                   │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 2. Browser includes session cookie                  │
│    Cookie: connect.sid=s%3A7k9mQ2p...               │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 3. Express receives GET /profile                    │
│    → express-session middleware runs                │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 4. express-session reads cookie                     │
│    → Extracts session ID: "7k9mQ2p"                 │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 5. Find session in MongoDB                          │
│    → db.sessions.findOne({ _id: "7k9mQ2p" })        │
│    → Returns session document                       │
│    {                                                │
│      session: {                                     │
│        passport: {                                  │
│          user: "507f1f77..."                        │
│        }                                            │
│      }                                              │
│    }                                                │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 6. passport.session() runs                          │
│    → Calls deserializeUser                          │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 7. deserializeUser fetches user                     │
│    → Input: "507f1f77..." (user ID from session)    │
│    → User.findById("507f1f77...")                   │
│    → Returns full user object from MongoDB          │
│    {                                                │
│      _id: ObjectId("507f1f77..."),                  │
│      username: "johndoe",                           │
│      password: "$2b$10$..."                         │
│    }                                                │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 8. Attach user to request                           │
│    → req.user = user object                         │
│    → req.isAuthenticated() will now return true     │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 9. checkAuthenticated middleware runs               │
│    → Checks req.isAuthenticated()                   │
│    → Returns: true (user is logged in) ✅           │
│    → Calls next()                                   │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 10. Route handler executes                          │
│     → res.render('profile')                         │
│     → Can access req.user for user data             │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 11. Browser displays profile page ✅                │
└─────────────────────────────────────────────────────┘
```

**What if user is NOT logged in?**

```
Steps 1-5: Same (but no session found or no passport.user)
           ↓
Step 6: req.user = undefined
        req.isAuthenticated() → false
           ↓
Step 7: checkAuthenticated middleware
        → req.isAuthenticated() → false ❌
        → res.redirect('/login')
           ↓
Step 8: User sent to login page
```

---

### Journey 4: Logout

**Step-by-Step:**

```
┌─────────────────────────────────────────────────────┐
│ 1. Logged-in user clicks "Logout" link             │
│    → Visits /logout                                 │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 2. Express receives GET /logout                     │
│    → Session middleware runs (loads session)        │
│    → Passport middleware runs (loads user)          │
│    → req.user is available                          │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 3. Route handler executes                           │
│    → req.logout() is called                         │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 4. Passport removes user from session              │
│    Before: {                                        │
│      passport: { user: "507f1f77..." }              │
│    }                                                │
│                                                     │
│    After: {                                         │
│      // passport.user removed!                      │
│    }                                                │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 5. Update session in MongoDB                        │
│    → Saves modified session                         │
│    → Session still exists, but no user data         │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 6. Redirect to home page                            │
│    → res.redirect('/')                              │
│    → Browser navigates to /                         │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 7. Logout complete! ✅                               │
│    → req.isAuthenticated() now returns false        │
│    → Cannot access protected routes                 │
│    → Must log in again to access /profile           │
└─────────────────────────────────────────────────────┘
```

---

## 🔒 Security Explained

### 1. Why Hash Passwords?

**The Problem:**

If database is hacked and passwords are plain text:

```json
// ❌ DANGER! Plain text passwords
{
  "username": "johndoe",
  "password": "password123"  ← Hacker can see this!
}
```

Hacker can now:
- Log in as any user
- Use passwords on other websites (people reuse passwords!)
- Sell credentials on dark web

**The Solution: Bcrypt**

```json
// ✅ SAFE! Hashed passwords
{
  "username": "johndoe",
  "password": "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgWPEyVPvLj5pN8dQeJhKLH3LNhq"
}
```

Even if hacker gets database:
- Can't reverse hash to get original password
- Can't use hash to log in (server rehashes entered password)
- Would take millions of years to crack one password

---

### 2. How Bcrypt Works

**A) Hashing with Salt**

```javascript
Input: "password123"
         ↓
Generate random salt: "x7k9mQ2p"
         ↓
Combine: "password123" + "x7k9mQ2p"
         ↓
Hash with algorithm: hash("password123x7k9mQ2p")
         ↓
Repeat 1024 times (2^10 rounds)
         ↓
Final hash: "$2b$10$x7k9mQ2p.N9qo8uLOickgx2ZMRZoMyeIjZAgWPEyVPvLj5pN8d"
                     ↑        ↑        ↑
                  version   salt    actual hash
```

**Same password = different hash each time:**

```javascript
bcrypt.hash("password123", 10);
// Result 1: "$2b$10$ABC...def"

bcrypt.hash("password123", 10);
// Result 2: "$2b$10$XYZ...uvw"  ← Different salt, different hash!
```

---

**B) Verification**

```javascript
// User enters: "password123"
// Database has: "$2b$10$x7k9mQ2p.N9qo8uLOick..."

bcrypt.compare("password123", "$2b$10$x7k9mQ2p.N9qo8uLOick...")

How it works:
  1. Extract salt from stored hash: "x7k9mQ2p"
  2. Hash entered password with same salt
  3. Compare results
  4. Match? → true (correct password)
     Don't match? → false (wrong password)
```

---

**C) Why Slow is Good**

```javascript
saltRounds = 10 → 1024 iterations → ~100ms per hash
```

**For legitimate users:**
- 100ms is barely noticeable
- Happens once per login

**For hackers trying to crack:**
- Must try millions of passwords
- 1,000,000 attempts × 100ms = 27 hours per account!
- With 10,000 accounts = years of computing time

---

### 3. Session Security

**How Sessions Are Secured:**

**A) Encrypted Cookies**

```javascript
session({
  secret: 'keyboard cat',  // Encryption key
  ...
})
```

**Cookie sent to browser:**
```
connect.sid=s%3A7k9mQ2p.HMAC_signature_here
                        ↑
            Cryptographic signature prevents tampering
```

**If user tries to change cookie:**
```
Original:  s%3A7k9mQ2p.valid_signature
Tampered:  s%3A7k9mQ2p.invalid_signature ← Server rejects!
```

---

**B) Server-Side Storage**

```
Browser stores:   → Cookie with session ID only
Server stores:    → Full session data in MongoDB
```

**Advantages:**
- User can't see sensitive data (it's on server)
- User can't modify session data (it's on server)
- If cookie is stolen, can invalidate session on server

---

**C) HTTPS in Production**

```javascript
cookie: {
  secure: true,    // Only send cookie over HTTPS
  httpOnly: true,  // JavaScript can't access cookie (prevents XSS)
}
```

**What this prevents:**
- `secure: true` → Cookie not sent over unencrypted HTTP
- `httpOnly: true` → Malicious JavaScript can't steal cookie

---

### 4. Attack Prevention

**A) SQL Injection** - Not applicable (using MongoDB)

**B) XSS (Cross-Site Scripting)**

```javascript
// Prevent JavaScript from accessing session cookie
cookie: { httpOnly: true }
```

**C) CSRF (Cross-Site Request Forgery)**

- Would need CSRF tokens (not implemented in this basic example)
- For production, use `csurf` package

**D) Brute Force**

- Bcrypt's slow hashing helps
- For production, add rate limiting with `express-rate-limit`

**E) Session Hijacking**

- Use HTTPS in production (`cookie: { secure: true }`)
- Short session expiration (`cookie: { maxAge: 86400000 }`)

---

## 🧪 Testing the Application

### Setup

**1. Start MongoDB:**

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

**2. Create `.env` file:**

```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/passport-auth-db
SESSION_SECRET=your_super_secret_key_here
```

**3. Install dependencies:**

```bash
npm install
```

**4. Start server:**

```bash
npm start
```

You should see:
```
Server is running at http://localhost:5000
✅ Connected to MongoDB
```

---

### Test Cases

**Test 1: Registration**

1. Visit: http://localhost:5000/register
2. Fill form:
   - Username: `testuser`
   - Password: `test1234`
3. Click "Register"
4. Should redirect to login page

**Verify in MongoDB:**

```bash
mongosh
use passport-auth-db
db.users.find().pretty()
```

You should see:
```json
{
  "_id": ObjectId("..."),
  "username": "testuser",
  "password": "$2b$10$...",  // ← Hashed!
  "__v": 0
}
```

---

**Test 2: Login**

1. Visit: http://localhost:5000/login
2. Fill form:
   - Username: `testuser`
   - Password: `test1234`
3. Click "Login"
4. Should redirect to profile page

**Verify in browser:**
- Open DevTools → Application → Cookies
- Should see: `connect.sid` cookie

**Verify in MongoDB:**

```bash
db.sessions.find().pretty()
```

You should see:
```json
{
  "_id": "...",
  "expires": ISODate("..."),
  "session": {
    "cookie": { "maxAge": 86400000 },
    "passport": {
      "user": "..." // ← Your user ID!
    }
  }
}
```

---

**Test 3: Protected Route**

1. While logged in, visit: http://localhost:5000/profile
   - Should show profile page ✅

2. Open new incognito window
3. Visit: http://localhost:5000/profile
   - Should redirect to /login ✅

---

**Test 4: Logout**

1. While logged in, visit: http://localhost:5000/logout
2. Should redirect to home page
3. Try visiting /profile
   - Should redirect to /login ✅

**Verify in MongoDB:**

```bash
db.sessions.find().pretty()
```

Session still exists, but no `passport.user`:
```json
{
  "session": {
    "cookie": { "maxAge": 86400000 }
    // No passport.user! ✅
  }
}
```

---

**Test 5: Already Logged In**

1. Log in successfully
2. Try visiting /login again
   - Should redirect to /profile ✅
3. Try visiting /register again
   - Should redirect to /profile ✅

This is the `checkLoggedIn` middleware in action!

---

### Debug Tips

**Problem: Can't connect to MongoDB**

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Start MongoDB service

```bash
# Mac
brew services start mongodb-community

# Windows
net start MongoDB

# Or check .env MONGO_URL is correct
```

---

**Problem: Password comparison fails**

```javascript
// Make sure you're using bcrypt.compare, not ==
const isValid = await bcrypt.compare(enteredPassword, storedHash);
```

---

**Problem: Session not persisting**

Check middleware order in `app.js`:

```javascript
// ✅ Correct order
app.use(session(...));          // First
app.use(passport.initialize()); // Second
app.use(passport.session());    // Third
```

---

**Problem: req.user is undefined**

Make sure deserializeUser is called:

```javascript
// In config/passport.js
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user); // Make sure this runs!
});
```

---

## ❓ Common Questions

### Q1: Why use sessions instead of JWT?

**Sessions (what this project uses):**

**Pros:**
- Can invalidate on server (logout works immediately)
- More secure (data stored server-side)
- Easier to implement

**Cons:**
- Requires database lookup on each request
- Harder to scale (need shared session store)

**JWT (alternative approach):**

**Pros:**
- Stateless (no database lookup needed)
- Easier to scale

**Cons:**
- Can't invalidate (token valid until expiry)
- Token stored client-side (less secure)
- Larger cookie size

**Use sessions when:** Building traditional web apps, need instant logout

**Use JWT when:** Building APIs, need to scale horizontally

---

### Q2: Why save only user ID in session?

**Saving full user object:**

```json
{
  "passport": {
    "user": {
      "id": "507f1f77...",
      "username": "johndoe",
      "email": "john@example.com",
      "profile": {...},
      "settings": {...}
    }
  }
}
```

**Problems:**
- Large session size (more MongoDB storage)
- Slower to read/write on each request
- If user data changes, session out of sync

**Saving only ID:**

```json
{
  "passport": {
    "user": "507f1f77..."
  }
}
```

**Benefits:**
- Tiny session size (just a string)
- Fast to read/write
- Always get fresh user data from database

---

### Q3: What happens if session expires?

```javascript
session({
  cookie: {
    maxAge: 86400000  // 24 hours in milliseconds
  }
})
```

**After 24 hours:**
1. Session document deleted from MongoDB
2. Cookie still in browser (but invalid)
3. User visits protected route
4. Session not found → `req.user` is undefined
5. `req.isAuthenticated()` returns false
6. User redirected to login

User must log in again to create new session.

---

### Q4: Can I access req.user in EJS templates?

**Yes!** Passport makes `req.user` available everywhere.

**Example - Display username in profile.ejs:**

```html
<%- include('layout/header') %>
  <main>
    <h1>Profile Page</h1>
    <% if (user) { %>
      <p>Welcome, <%= user.username %>!</p>
      <p>Your ID: <%= user._id %></p>
    <% } %>
  </main>
<%- include('layout/footer') %>
```

**Pass user to template in app.js:**

```javascript
app.get('/profile', checkAuthenticated, (req, res) => {
  res.render('profile', { user: req.user });
});
```

---

### Q5: How do I add more fields to user?

**Update user.model.js:**

```javascript
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
```

**Update registration route in app.js:**

```javascript
app.post('/register', async (req, res) => {
  const { username, email, password, age } = req.body;

  // Hash password
  const hash = await bcrypt.hash(password, 10);

  // Create user with new fields
  const newUser = new User({
    username,
    email,
    password: hash,
    age,
  });

  await newUser.save();
  res.redirect('/login');
});
```

---

### Q6: How do I implement "Remember Me"?

**Extend session expiration:**

```javascript
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');

    req.login(user, (err) => {
      if (err) return next(err);

      // If "remember me" checked, extend session
      if (req.body.remember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day
      }

      return res.redirect('/profile');
    });
  })(req, res, next);
});
```

**Add checkbox to login form:**

```html
<input type="checkbox" name="remember" id="remember">
<label for="remember">Remember Me</label>
```

---

### Q7: How do I add password reset?

**Basic flow:**

1. User clicks "Forgot Password"
2. Enter email → Server generates random token
3. Save token to user document with expiration
4. Send email with reset link: `/reset-password?token=xxx`
5. User clicks link → Verify token not expired
6. Show form to enter new password
7. Hash new password and update user

**Would need:**
- Email sending (nodemailer)
- Token generation (crypto)
- Additional routes and database fields

---

### Q8: Is this production-ready?

**Almost! Need to add:**

1. **Use environment variable for session secret:**
   ```javascript
   secret: process.env.SESSION_SECRET
   ```

2. **Enable HTTPS in production:**
   ```javascript
   cookie: { secure: true, httpOnly: true }
   ```

3. **Add input validation:**
   ```bash
   npm install express-validator
   ```

4. **Add rate limiting:**
   ```bash
   npm install express-rate-limit
   ```

5. **Add CSRF protection:**
   ```bash
   npm install csurf
   ```

6. **Add logging:**
   ```bash
   npm install morgan winston
   ```

7. **Add password requirements:**
   - Minimum 8 characters
   - Must contain uppercase, lowercase, number

8. **Add error handling:**
   - Flash messages for errors
   - Proper error pages

---

## 🎯 Summary

### Key Takeaways

1. **Authentication** = Verifying who you are
2. **Sessions** = Remembering who you are across requests
3. **Bcrypt** = Securely hashing passwords
4. **Passport** = Middleware that handles auth logic
5. **Middleware** = Functions that protect routes

### The Flow

```
Registration → Hash Password → Save to DB
     ↓
   Login → Verify Credentials → Create Session → Send Cookie
     ↓
Access Protected Route → Check Cookie → Load Session → Load User → Authorize
     ↓
  Logout → Remove User from Session → Redirect
```

### Security Principles

- ✅ Never store plain text passwords
- ✅ Always hash with bcrypt (salt + slow hashing)
- ✅ Use sessions for stateful authentication
- ✅ Store sessions server-side (MongoDB)
- ✅ Encrypt session cookies
- ✅ Use HTTPS in production
- ✅ Validate all user input
- ✅ Protect routes with middleware

---

## 🚀 Next Steps

Now that you understand authentication, try:

1. **Add email field** to user registration
2. **Display user info** in profile page using `req.user`
3. **Add "Remember Me"** checkbox
4. **Implement password requirements** (min length, complexity)
5. **Add flash messages** for login errors
6. **Try OAuth** (Google/Facebook login)
7. **Add user roles** (admin, user, moderator)
8. **Implement password reset** with email tokens

---

## 📚 Resources

**Official Docs:**
- [Passport.js Documentation](http://www.passportjs.org/docs/)
- [Express-session Documentation](https://github.com/expressjs/session)
- [Bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)

**Tutorials:**
- [MDN Web Docs - HTTP Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Congratulations! 🎉** You now understand how authentication works from the ground up!

This is the foundation for building secure web applications. Keep practicing and building! 🚀
