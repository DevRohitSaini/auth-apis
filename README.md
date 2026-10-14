# Auth API

A small REST API for registering users and signing them in. It uses MongoDB to store users, bcryptjs to hash passwords, and JSON Web Tokens (JWTs) to issue an access token after registration or login.

## Requirements

- Node.js **20.19.0 or newer**
- npm (included with Node.js)
- A MongoDB database, either running locally or hosted (for example, MongoDB Atlas)

## Setup

1. **Open a terminal in the project folder.**

   ```text
   cd path\to\auth-apis
   ```

2. **Install the project dependencies.**

   ```bash
   npm install
   ```

3. **Create a `.env` file in the project root**, next to `package.json` and `server.js`.

   Add the following settings and replace the example values as needed:

   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   MONGO_URI=mongodb://127.0.0.1:27017/auth-api
   JWT_SECRET=replace-this-with-a-long-random-secret
   JWT_EXPIRES_IN=1h
   SOLTROUNDS=10
   ```

   What each setting does:

   | Setting | Purpose |
   | --- | --- |
   | `PORT` | Port the API listens on. |
   | `NODE_ENV` | Set to `development` to enable Morgan's development request log. |
   | `CLIENT_URL` | Allowed frontend origin. Multiple origins can be comma-separated. |
   | `MONGO_URI` | MongoDB connection string. Use your Atlas connection string if your database is hosted. |
   | `JWT_SECRET` | Secret used to sign access tokens. Use a long, private random value. |
   | `JWT_EXPIRES_IN` | Token lifetime accepted by `jsonwebtoken`, for example `1h` or `7d`. |
   | `SOLTROUNDS` | bcrypt work factor. The app accepts an integer from `4` to `31`; `10` is a practical starting value for local development. |

   Keep `.env` private. Do not put real credentials or production secrets in source control.

4. **Start MongoDB** (if using a local database). Make sure it is available at the address in `MONGO_URI`. If you use MongoDB Atlas, create a database and use its connection string instead.

5. **Start the API.**

   For development, with automatic restarts when files change:

   ```bash
   npm run dev
   ```

   For a normal start:

   ```bash
   npm start
   ```

   The default local URL with the example settings is `http://localhost:5000`. The root endpoint should respond with `API is running...`.

## API endpoints

All authentication endpoints are under `/api/auth`.

### Register

`POST /api/auth/signup`

Required JSON fields: `fullName`, `email`, and `password`.

```json
{
  "fullName": "Alex Example",
  "email": "alex@example.com",
  "password": "GoodPassword1!"
}
```

Passwords must be at least 8 characters and include a lowercase letter, an uppercase letter, a number, and a symbol. Email addresses are trimmed and converted to lowercase for lookup/storage.

A successful request returns HTTP `201` with an access token and safe user details. The password hash is not returned.

### Sign in

`POST /api/auth/signin`

Required JSON fields: `email` and `password`.

```json
{
  "email": "alex@example.com",
  "password": "GoodPassword1!"
}
```

A successful request returns HTTP `200` with an access token and safe user details.

### Get users (requires a token)

`GET /api/users`

Send the access token returned by signup or signin in the `Authorization` header:

```text
Authorization: Bearer <accessToken>
```

The authentication middleware verifies the token and its expiration before allowing the request. A missing token returns HTTP `401`; an invalid or expired token returns HTTP `403`. A successful request returns HTTP `200` with the users list.

### Health check

- `GET /` returns `API is running...`.
- `GET /api/` returns the same health-check message.

## Error responses

The API returns JSON messages for common authentication errors:

- `400` — required fields are missing, the password does not meet the strength rules, or the email/password combination is invalid.
- `409` — the email address is already registered.
- `401` — the access token is missing from a protected request.
- `403` — the access token is invalid or expired.
- `500` — an unexpected server error occurred.

## Project structure

```text
.
├── app/
│   ├── config/databse.js       # MongoDB connection
│   ├── controller/auth.js      # Registration and sign-in logic
│   ├── controller/user.js      # User-list endpoint
│   ├── middleware/authenticate.js # JWT verification middleware
│   ├── model/user.js           # Mongoose user schema
│   ├── routes.js               # API route setup
│   ├── routes/auth.js          # Signup and signin routes
│   ├── routes/user.js          # Protected user route
│   └── utils/jwt-token.js      # JWT creation
├── server.js                   # Express app and server startup
├── package.json                # Scripts and dependencies
└── .env                        # Local environment settings (create this)
```

## Packages used

- **Express** — HTTP server and routing.
- **Mongoose** — MongoDB connection and user model.
- **bcryptjs** — password hashing and password comparison.
- **jsonwebtoken** — signing access tokens.
- **dotenv** — loading settings from `.env`.
- **cors** — allowing requests from configured frontend origins.
- **Helmet** — setting security-related HTTP headers.
- **Morgan** — development HTTP request logging.
- **Nodemon** (development dependency) — restarting the server when files change.

## Current limitations

- The protected user-list endpoint currently returns user documents from the database. Review which fields it returns before using this endpoint in production.
- The `npm test` script is a placeholder and does not run an actual test suite yet.
