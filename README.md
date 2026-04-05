# Sycro — Backend

A Node.js + Express REST API built with TypeScript, MongoDB, and modern authentication. Supports JWT auth, Google OAuth, file uploads via Multer, and cloud storage via Cloudinary.

---

## Tech Stack

**Runtime**
- Node.js
- TypeScript
- tsx (development runner)

**Framework & Database**
- Express.js
- MongoDB Atlas
- Mongoose

**Authentication**
- JWT (jsonwebtoken)
- Google OAuth2 (google-auth-library)
- bcrypt (password hashing)

**File Handling**
- Multer
- Cloudinary
- multer-storage-cloudinary

**Other**
- CORS
- dotenv
- Nodemon

---

## Project Structure

```
backend/
├── controllers/
│   ├── authController.ts
│   ├── filesController.ts
│   ├── quizController.ts
│   └── userController.ts
├── middleware/
│   └── auth.ts
├── models/
│   ├── Notification.ts
│   ├── User.ts
│   ├── User_files.ts
│   ├── User_Quiz_Attempts.ts
│   └── User_Quizes.ts
├── routes/
│   ├── authRoutes.ts
│   ├── fileRoutes.ts
│   ├── quizRoutes.ts
│   └── userRoutes.ts
├── server.ts
├── types.ts
├── tsconfig.json
└── .env
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/sycro.git
cd sycro/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```env
PORT=5000
MONGO_URI_SIKRET_KEY=your_mongodb_atlas_uri
JWT_SICKRET_KEY_LOL=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_CLOUD_API_KEY=your_api_key
CLOUDINARY_CLOUD_API_SECRET=your_api_secret

GOOGLE_CLIENT_ID=your_google_client_id

FRONTEND_URL=http://localhost:5173
FRONTEND_URL_PROD=your_production_frontend_url

STORAGE_MODE=local
LOCAL_UPLOAD_PATH=uploads
```

### 4. Run in development

```bash
npm run dev
```

Server runs at `http://localhost:5000`

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Runs server with nodemon and tsx |
| `npm run build` | Compiles TypeScript to JavaScript |
| `npm run start:prod` | Runs compiled output for production |

---

## API Routes

### Auth
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/registration` | Register new user | No |
| POST | `/login` | Login with email and password | No |
| POST | `/api/auth/google` | Google OAuth login | No |
| GET | `/auth/me` | Get current logged in user | Yes |

### Files
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/files` | Upload files and cover photo | Yes |
| GET | `/files-fetch` | Get all posts | No |
| GET | `/post/:id` | Get single post | No |
| POST | `/post/:id/upvote` | Upvote a post | Yes |
| POST | `/post/:id/downvote` | Downvote a post | Yes |
| POST | `/post/:postId/comments` | Add comment to post | Yes |
| GET | `/post/:postId/comments` | Get comments on post | Yes |

### Quizzes
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/quiz/quizzes` | Get all quizzes | Yes |
| GET | `/quiz/quizzes/:id` | Get quiz by ID | Yes |
| POST | `/quiz/create` | Create a new quiz | Yes |
| POST | `/quiz/submit/:quizId` | Submit quiz answers | Yes |
| GET | `/quiz/attempts/:quizId` | Get attempts for a quiz | Yes |

### Users
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/search` | Search users by username | Yes |
| POST | `/api/bookmark/:postId` | Bookmark a post | Yes |
| POST | `/api/bookmark/quiz/:quizId` | Bookmark a quiz | Yes |
| GET | `/api/bookmarks` | Get all bookmarks | Yes |
| GET | `/api/bookmarks/ids` | Get bookmark IDs | Yes |
| GET | `/api/notifications` | Get notifications | Yes |
| PATCH | `/api/notifications/read` | Mark notifications as read | Yes |

---

## Authentication Flow

### Regular Login
1. User registers with email and password
2. Password is hashed with bcrypt
3. On login, JWT token is generated and returned
4. Frontend stores token and sends it in `Authorization: Bearer <token>` header
5. Protected routes verify the token via `auth.ts` middleware

### Google OAuth
1. Frontend sends Google ID token to `/api/auth/google`
2. Backend verifies token using google-auth-library
3. User is created or updated in MongoDB
4. JWT is generated and returned to frontend

---

## File Upload Flow

**Local mode** (`STORAGE_MODE=local`)
- Files saved to `uploads/` folder on disk
- File path stored in MongoDB

**Cloud mode** (`STORAGE_MODE=cloud`)
- Files sent directly to Cloudinary via multer-storage-cloudinary
- Cloudinary URL stored in MongoDB

---

## MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster and database user
3. For local development: whitelist your IP
4. For production on Render: set IP access to `0.0.0.0/0`
5. Copy the connection string into your `.env`

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Google OAuth2 API
4. Configure the OAuth Consent Screen
5. Create an OAuth Client ID
6. Add your Client ID to `.env`

---

## Deployment (Render)

1. Push backend to GitHub
2. Create a new Web Service on Render
3. Set the following:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/server.js`
4. Add all environment variables from `.env`
5. Set MongoDB Atlas IP access to `0.0.0.0/0`
6. Deploy

---

## Security

- Passwords hashed with bcrypt
- JWT middleware on all protected routes
- Environment variables via dotenv
- CORS restricted to allowed frontend origins
- MongoDB Atlas IP restrictions

---

## Author

Developed by Mike. Built with Node.js, Express, TypeScript, and MongoDB.
