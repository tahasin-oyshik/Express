# 🎯 How to Build a Server-Side Validation API Project - Complete Guide

Based on the actual code in this project, here's the exact order you should follow to build a similar validation API from scratch.

---

## 1. 📋 PHASE 1: Project Foundation

### Step 1: Create Project Folder & Initialize NPM

```bash
mkdir user-validation-api
cd user-validation-api
npm init -y
```

**Why first?** Sets up the project structure and creates `package.json`.

---

### Step 2: Install Dependencies

```bash
npm install express express-validator
npm install --save-dev nodemon
```

**Why now?** You need these packages before writing any code.

- `express` - Web framework for building APIs
- `express-validator` - Validation and sanitization middleware
- `nodemon` - Auto-restart server during development

---

### Step 3: Update package.json Scripts

Edit `package.json` and add:

```json
"scripts": {
  "start": "nodemon index.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

**Why now?** You'll use `npm start` to run the server with auto-reload.

---

## 2. 📁 PHASE 2: Folder Structure Setup

### Step 4: Create Project Folders

```bash
mkdir controllers routes validation
```

**Why now?** Organize code into logical modules:

- `controllers/` - Business logic for handling requests
- `routes/` - API endpoint definitions
- `validation/` - Validation rules and middleware

---

## 3. 🛡️ PHASE 3: Validation Layer (Security Foundation)

### Step 5: Create `validation/index.js` (Validation Error Handler)

```javascript
const { check, validationResult } = require('express-validator');

// Input validation middleware
// This runs after validation rules to check if any errors occurred
exports.runValidation = (request, response, next) => {
  const errors = validationResult(request);
  let errorsList = errors.array().map((error) => error.msg);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errorsList });
  }
  next();
};
```

**Why now?** This middleware will be used by all routes to check validation results. Create it early so routes can reference it.

**What it does:**

- Extracts validation errors from the request
- Maps errors to a simple array of messages
- Returns 400 status with error list if validation fails
- Calls `next()` if validation passes, allowing the request to proceed

---

### Step 6: Create `validation/auth.js` (Validation Rules)

```javascript
const { check } = require('express-validator');

exports.userRegistrationValidator = [
  // Input validation rules
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is missing')
    .isLength({ min: 5 })
    .withMessage('name must have at least 5 character')
    .isLength({ max: 10 })
    .withMessage('name can have maximum 10 character'),
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is missing')
    .isEmail()
    .withMessage('Not a valid email'),
  check('password')
    .trim()
    .notEmpty()
    .withMessage('Password is missing')
    .isLength({ min: 5 })
    .withMessage('password must have at least 5 character'),
  check('dob')
    .trim()
    .notEmpty()
    .withMessage('dob is missing')
    .isISO8601()
    .toDate()
    .withMessage('Not a valid dob'),
];

exports.userLoginValidator = [
  // Input validation rules
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is missing')
    .isEmail()
    .withMessage('Not a valid email'),
  check('password')
    .trim()
    .notEmpty()
    .withMessage('Password is missing')
    .isLength({ min: 5 })
    .withMessage('password must have at least 5 character'),
];
```

**Why now?** Routes need these validation rules, so create them before the routes.

**Validation Rules Explained:**

**Registration Validator:**

- `name`: Trimmed whitespace, required, 5-10 characters
- `email`: Trimmed whitespace, required, valid email format
- `password`: Trimmed whitespace, required, minimum 5 characters
- `dob`: Trimmed whitespace, required, valid ISO8601 date format

**Login Validator:**

- `email`: Trimmed whitespace, required, valid email format
- `password`: Trimmed whitespace, required, minimum 5 characters

---

## 4. 🎮 PHASE 4: Controller Layer (Business Logic)

### Step 7: Create `controllers/user.js` (User Operations)

```javascript
const registerUser = (request, response) => {
  try {
    const { name, email, password, dob } = request.body;
    const newUser = {
      name,
      email,
      password,
      dob,
    };
    response.status(201).json({ message: 'user is created', newUser });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

const loginUser = (request, response) => {
  try {
    const { email, password } = request.body;
    if (email == 'tahasin.oyshik@gmail.com' && password == '12345') {
      response.status(200).json({ message: 'user is loggedIn' });
    } else {
      response.status(400).json({ message: 'email/password is wrong' });
    }
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
```

**Why now?** Routes need these controller functions to handle the business logic.

**Controller Functions Explained:**

**registerUser:**

- Extracts user data from request body
- Creates new user object (in real app, would save to database)
- Returns 201 (Created) status with user data
- Catches errors and returns 500 status

**loginUser:**

- Extracts credentials from request body
- Checks against hardcoded credentials (demo only - use database in production)
- Returns 200 (Success) if credentials match
- Returns 400 (Bad Request) if credentials don't match
- Catches errors and returns 500 status

---

## 5. 🛣️ PHASE 5: Routes Layer (API Endpoints)

### Step 8: Create `routes/user.js` (Define API Endpoints)

```javascript
const userRoutes = require('express').Router();
const { body, validationResult } = require('express-validator');
const { runValidation } = require('../validation');
const { registerUser, loginUser } = require('../controllers/user');
const { userRegistrationValidator, userLoginValidator } = require('../validation/auth');

// This route handles new user registration with validation.
// Required fields: name, email, password, dob (date of birth)
userRoutes.post('/register', userRegistrationValidator, runValidation, registerUser);

// This route handles user login with validation.
// Required fields: email, password
userRoutes.post('/login', userLoginValidator, runValidation, loginUser);

module.exports = userRoutes;
```

**Why now?** The main `index.js` file needs this router to set up API endpoints.

**Route Structure Explained:**

Each route uses a **middleware chain**:

1. **Validation Rules** (`userRegistrationValidator` or `userLoginValidator`) - Validates input
2. **Validation Handler** (`runValidation`) - Checks if validation passed
3. **Controller Function** (`registerUser` or `loginUser`) - Processes the request

**Endpoints:**

- `POST /api/register` - Create new user with validation
- `POST /api/login` - Authenticate user with validation

---

## 6. 🚀 PHASE 6: Application Entry Point

### Step 9: Create `index.js` (Server Entry Point)

```javascript
const express = require('express');
const userRoutes = require('./routes/user');

const app = express();

const PORT = 3009;

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api', userRoutes);

app.get('/test', (request, response) => {
  response.send('testing the server');
});
```

**Why last?** This is the entry point that ties everything together.

**Application Setup Explained:**

1. **Import Dependencies** - Express and user routes
2. **Create Express App** - Initialize the application
3. **Set Port** - Define server port (3009)
4. **Start Server** - Listen on specified port
5. **Middleware Setup:**
   - `express.urlencoded({ extended: true })` - Parse URL-encoded form data
   - `express.json()` - Parse JSON request bodies
6. **Mount Routes** - All user routes available under `/api` prefix
7. **Test Endpoint** - Simple route to verify server is running
