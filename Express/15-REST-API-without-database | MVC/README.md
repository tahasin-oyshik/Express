REST API without Database - MVC Architecture Flow
Step-by-Step File Creation Order:

1. Initialize Project
   npm init -y
   npm install express cors body-parser uuid nodemon

2. Create package.json (Already done by npm init)
   Add start script: "start": "nodemon index.js"

3. Create Folder Structure
   mkdir views models controllers routes

4. Create views/index.html ⭐ START HERE
   Simple HTML welcome page
   This is the homepage for your API

5. Create models/users.model.js 📊 DATA LAYER
   Import uuid for generating IDs
   Create initial users array with sample data
   Export the users array

6. Create controllers/users.controller.js 🧠 BUSINESS LOGIC
   Import the users model
   Import uuid
   Create 4 controller functions:
   getAllUsers() - GET all users
   createUser() - POST new user
   updateUser() - PUT/update user by ID
   deleteUser() - DELETE user by ID
   Export all controller functions

7. Create routes/users.route.js 🛣️ ROUTING LAYER
   Import Express Router
   Import all controller functions
   Define routes:
   GET / → getAllUsers
   POST / → createUser
   PUT /:id → updateUser
   DELETE /:id → deleteUser
   Export router

8. Create app.js ⚙️ APP CONFIGURATION
   Import express, cors, body-parser
   Import users router
   Configure middleware (cors, body-parser)
   Mount routes (/users → usersRouter)
   Add home route (/ → serve index.html)
   Add 404 error handler
   dd global error handler
   Export app

9. Create index.js 🚀 SERVER ENTRY POINT
   Import app from app.js
   Define PORT (4000)
   Start server with app.listen()

🔄 REQUEST-RESPONSE FLOW (Every request follows this)
┌──────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE CHAIN │
│ Every request passes through these in order: │
│ 1. app.js:10 → cors() (Add CORS headers) │
│ 2. app.js:11 → bodyParser.urlencoded() (Parse form data) │
│ 3. app.js:12 → bodyParser.json() (Parse JSON body) │
│ 4. Route matching → Controller → Response │
└──────────────────────────────────────────────────────────────────┘

📡 API ENDPOINTS & FLOWS

1️⃣ GET / (Home Page)
CLIENT REQUEST:
GET http://localhost:4000/

SERVER FLOW:
index.js:4 → Receives request on PORT 4000
app.js:10-12 → Middleware: cors, bodyParser (skip - no body)
app.js:18 → Matches route: app.get('/', ...)
app.js:19 → response.sendFile(\_\_dirname + '/views/index.html')

CLIENT RESPONSE:
Status: 200 OK
Body: HTML page "Welcome to REST API Server"

2️⃣ GET /users (Get All Users)
CLIENT REQUEST:
GET http://localhost:4000/users

SERVER FLOW:
index.js:4 → Receives request
app.js:10-12 → Middleware chain (cors, bodyParser)
app.js:15 → Matches '/users', forwards to usersRouter
users.route.js:10 → router.get('/', getAllUsers)
users.controller.js:5-6 → Function executes: - Reads users from model (in-memory) - response.status(200).json({ users })

CLIENT RESPONSE:
Status: 200 OK
Body: {
"users": [
{ "id": "uuid-1", "username": "Mr Vulturi", "email": "mrvulturi@gmail.com" },
{ "id": "uuid-2", "username": "GG Hulk", "email": "gghulkastine@gmail.com" }
]
}
Key Lines:
users.route.js:10 - Route: router.get('/', getAllUsers)
users.controller.js:6 - Logic: response.status(200).json({ users })

3️⃣ POST /users (Create New User)
CLIENT REQUEST:
POST http://localhost:4000/users
Headers: Content-Type: application/json
Body: {
"username": "John Doe",
"email": "john@example.com"
}

SERVER FLOW:
index.js:4 → Receives POST request
app.js:10 → cors() - Adds CORS headers
app.js:11 → bodyParser.urlencoded() - Skips (not form data)
app.js:12 → bodyParser.json() - Parses JSON body
request.body = { username: "John Doe", email: "john@example.com" }
app.js:15 → Forwards to usersRouter
users.route.js:11 → router.post('/', createUser)
users.controller.js:10-18 → Function executes:
Line 11: const { username, email } = request.body
// username = "John Doe", email = "john@example.com"

    Line 12-16: const newUser = {
                  id: uuidv4(),        // Generates unique ID
                  username,            // "John Doe"
                  email                // "john@example.com"
                }

    Line 17:  users.push(newUser)
              // Adds to users array in memory

    Line 18:  response.status(201).json({ users })
              // Sends all users back

CLIENT RESPONSE:
Status: 201 Created
Body: {
"users": [
{ "id": "uuid-1", "username": "Mr Vulturi", ... },
{ "id": "uuid-2", "username": "GG Hulk", ... },
{ "id": "uuid-3", "username": "John Doe", "email": "john@example.com" } ← NEW
]
}
Key Lines:
app.js:12 - Middleware: bodyParser.json() parses request body
users.route.js:11 - Route: router.post('/', createUser)
users.controller.js:11 - Extract: const { username, email } = request.body
users.controller.js:12-16 - Create: newUser object with uuidv4()
users.controller.js:17 - Store: users.push(newUser)
users.controller.js:18 - Respond: status(201).json({ users })

4️⃣ PUT /users/:id (Update User)
CLIENT REQUEST:
PUT http://localhost:4000/users/abc-123-uuid-456
Headers: Content-Type: application/json
Body: {
"username": "Updated Name",
"email": "updated@example.com"
}

SERVER FLOW:
index.js:4 → Receives PUT request
app.js:10-12 → Middleware chain processes request
request.body = { username: "Updated Name", email: "updated@example.com" }
app.js:15 → Forwards to usersRouter
users.route.js:12 → router.put('/:id', updateUser)
request.params.id = "abc-123-uuid-456"
users.controller.js:22-31 → Function executes:
Line 23: const { id } = request.params
// id = "abc-123-uuid-456"

    Line 24:  const { username, email } = request.body
              // username = "Updated Name", email = "updated@example.com"

    Line 25-30: users.filter((user) => user.id == id)
                     .map((selecteduser) => {
                       selecteduser.username = username;
                       selecteduser.email = email;
                     })
                // Finds user with matching id and updates fields

    Line 31:  response.status(200).json({ users })
              // Sends updated users array

CLIENT RESPONSE:
Status: 200 OK
Body: {
"users": [
{ "id": "abc-123-uuid-456", "username": "Updated Name", "email": "updated@example.com" }, ← UPDATED
{ "id": "uuid-2", "username": "GG Hulk", ... }
]
}
Key Lines:
users.route.js:12 - Route: router.put('/:id', updateUser) extracts URL param
users.controller.js:23 - Extract ID: const { id } = request.params
users.controller.js:24 - Extract data: const { username, email } = request.body
users.controller.js:25-30 - Update: filter + map to modify user object
users.controller.js:31 - Respond: status(200).json({ users })

5️⃣ DELETE /users/:id (Delete User)
CLIENT REQUEST:
DELETE http://localhost:4000/users/abc-123-uuid-456

SERVER FLOW:
index.js:4 → Receives DELETE request
app.js:10-12 → Middleware chain (no body to parse)
app.js:15 → Forwards to usersRouter
users.route.js:13 → router.delete('/:id', deleteUser)
request.params.id = "abc-123-uuid-456"
users.controller.js:35-38 → Function executes:
Line 36: const { id } = request.params
// id = "abc-123-uuid-456"

    Line 37:  users = users.filter((user) => user.id !== id)
              // Removes user with matching id, keeps all others

    Line 38:  response.status(200).json({ users })
              // Sends remaining users

CLIENT RESPONSE:
Status: 200 OK
Body: {
"users": [
{ "id": "uuid-2", "username": "GG Hulk", ... }
// User with id "abc-123-uuid-456" is removed
]
}
Key Lines:
users.route.js:13 - Route: router.delete('/:id', deleteUser)
users.controller.js:36 - Extract ID: const { id } = request.params
users.controller.js:37 - Delete: users.filter((user) => user.id !== id)
users.controller.js:38 - Respond: status(200).json({ users })

6️⃣ 404 Error (Route Not Found)
CLIENT REQUEST:
GET http://localhost:4000/invalid-path

SERVER FLOW:
index.js:4 → Receives request
app.js:10-12 → Middleware chain
app.js:15 → '/invalid-path' does NOT match '/users' → skip
app.js:18 → Does NOT match '/' → skip
app.js:23-27 → 404 handler catches unmatched route
Line 24-26: response.status(404).json({ message: 'route not found' })

CLIENT RESPONSE:
Status: 404 Not Found
Body: { "message": "route not found" }

7️⃣ 500 Error (Server Error)
SCENARIO:
Any error thrown in middleware, routes, or controllers

SERVER FLOW:
app.js:30-34 → Global error handler catches error
Line 31-33: response.status(500).json({ message: 'something broke' })

CLIENT RESPONSE:
Status: 500 Internal Server Error
Body: { "message": "something broke" }
