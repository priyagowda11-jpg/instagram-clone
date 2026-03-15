# 📸 Instagram Clone — Full Stack Mobile App

> Built with React Native (Expo) + Node.js + MongoDB + Cloudinary + Socket.io

---

## 🗂️ Project Structure

```
instagram-clone/
├── server/                  # Backend (Node.js + Express)
│   ├── config/              # DB + Cloudinary config
│   ├── controllers/         # Business logic for each route
│   ├── middleware/          # JWT auth middleware
│   ├── models/              # MongoDB schemas (User, Post, Story, Message)
│   ├── routes/              # API route definitions
│   ├── socket/              # Socket.io real-time chat logic
│   ├── .env                 # ⚠️ SECRET keys (never push to GitHub)
│   └── server.js            # App entry point
│
├── mobile-app/              # Frontend (React Native + Expo)
│   ├── components/          # Reusable UI pieces (buttons, cards, etc.)
│   ├── screens/             # Full screens (Home, Login, Profile, etc.)
│   ├── navigation/          # Stack + Bottom Tab navigation setup
│   ├── context/             # Global state (Auth, User data)
│   ├── services/            # Axios API call functions
│   ├── hooks/               # Custom React hooks
│   ├── .env                 # ⚠️ API base URL (never push to GitHub)
│   └── App.js               # Root entry point
│
├── .gitignore               # Files to ignore in GitHub
└── README.md                # This file
```

---

## ⚙️ What Each Folder Does (Brief)

| Folder | What it does |
|---|---|
| `controllers/` | Handles what happens when an API is called (login logic, post logic) |
| `models/` | Defines database structure (what fields User/Post have) |
| `routes/` | Defines URL endpoints (POST /api/auth/login) |
| `middleware/` | Checks if user is logged in (JWT token check) |
| `socket/` | Real-time messaging using Socket.io |
| `screens/` | Each screen the user sees (HomeScreen, ProfileScreen) |
| `context/` | Stores logged-in user info globally across screens |
| `services/` | All Axios HTTP calls to the backend |
| `navigation/` | Connects all screens, defines tab bar + stack flow |

---

## 🔧 Prerequisites — Install These First

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/client) app on your Android phone
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free)
- [Cloudinary](https://cloudinary.com/) account (free)
- A code editor — [VS Code](https://code.visualstudio.com/) recommended

---

## 🚀 Step-by-Step Setup

### STEP 1 — Extract ZIP

1. Right-click your downloaded ZIP file
2. Click **"Extract All"**
3. Choose a location (e.g., Desktop)
4. Open the extracted folder

---

### STEP 2 — Open Terminal in VS Code

1. Open **VS Code**
2. Click `File → Open Folder` → select your project folder
3. Press `` Ctrl + ` `` to open the terminal

---

### STEP 3 — Setup Backend

```bash
# Go into server folder
cd server

# Install all backend packages
npm install
```

Create your `.env` file inside `/server`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_anything_random
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

> 🔴 Where to get these values — see `.env` Configuration section below

Start the backend:

```bash
npm run dev
```

✅ You should see: `Server running on port 5000` + `MongoDB connected`

---

### STEP 4 — Setup Mobile App

Open a **new terminal tab** (click `+` in VS Code terminal):

```bash
# Go into mobile app folder
cd mobile-app

# Install all frontend packages
npm install
```

Create your `.env` file inside `/mobile-app`:

```env
API_URL=http://YOUR_PC_IP_ADDRESS:5000
```

> 🔴 To find your PC IP: Open CMD → type `ipconfig` → look for **IPv4 Address** (e.g., `192.168.1.5`)
> Use that: `API_URL=http://192.168.1.5:5000`

Start the app:

```bash
npx expo start
```

✅ A **QR code** will appear in terminal

---

### STEP 5 — Run on Android Phone

1. Make sure your phone and PC are on the **same WiFi**
2. Open **Expo Go** app on your phone
3. Tap **"Scan QR Code"**
4. Scan the QR code from your terminal
5. App loads on your phone! 🎉

---

## 🔑 .env Configuration Guide

### MongoDB Atlas (Free Database)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free account
2. Create a **free cluster**
3. Click `Connect → Drivers`
4. Copy the connection string
5. Replace `<password>` with your DB password
6. Paste as `MONGO_URI=...`

### Cloudinary (Free Image/Video Storage)

1. Go to [cloudinary.com](https://cloudinary.com) → Create free account
2. Go to **Dashboard**
3. Copy: Cloud Name, API Key, API Secret
4. Paste each into your `.env`

### JWT Secret

- Just type any random string, e.g.: `JWT_SECRET=mysupersecret123abc`

---

## 📤 Upload to GitHub

### First Time Setup

```bash
# 1. Go to root project folder
cd instagram-clone

# 2. Initialize git
git init

# 3. Add all files
git add .

# 4. First commit
git commit -m "Initial commit - Instagram Clone"

# 5. Go to github.com → New Repository
#    Name it: instagram-clone
#    Keep it Public or Private → Click "Create Repository"

# 6. Copy the repo URL from GitHub, then run:
git remote add origin https://github.com/YOUR_USERNAME/instagram-clone.git

# 7. Push code
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub!

---

### Push Future Changes

```bash
git add .
git commit -m "describe what you changed"
git push
```

---

## 🚫 .gitignore — Files NOT Uploaded to GitHub

Create a `.gitignore` file in your root folder with this content:

```
# Dependencies
node_modules/

# Environment secrets
.env
*.env

# Expo
.expo/
dist/

# OS files
.DS_Store
Thumbs.db
```

> ⚠️ NEVER push `.env` to GitHub — it contains your secret keys!

---

## 📱 App Screens Overview

| Screen | What it does |
|---|---|
| `LoginScreen` | Email + password login |
| `RegisterScreen` | Create new account |
| `HomeScreen` | Feed of posts from followed users |
| `SearchScreen` | Search users by username |
| `CreatePostScreen` | Upload image + caption |
| `StoryUploadScreen` | Upload 24hr story |
| `ReelsScreen` | Scroll short videos |
| `ChatListScreen` | List of all conversations |
| `ChatScreen` | Real-time 1-on-1 chat |
| `NotificationsScreen` | Likes, follows, comments alerts |
| `ProfileScreen` | Your posts grid + bio + stats |
| `EditProfileScreen` | Change bio, name, profile pic |

---

## 🔌 API Endpoints Summary

### Auth
```
POST /api/auth/register    → Create account
POST /api/auth/login       → Login, returns JWT token
```

### Users
```
GET  /api/users/:id        → Get user profile
PUT  /api/users/update     → Edit profile
PUT  /api/users/follow/:id → Follow a user
PUT  /api/users/unfollow/:id → Unfollow a user
```

### Posts
```
POST /api/posts/create     → Create post
GET  /api/posts/feed       → Get home feed
DELETE /api/posts/:id      → Delete post
PUT  /api/posts/like/:id   → Like/Unlike post
POST /api/posts/comment/:id → Add comment
PUT  /api/posts/save/:id   → Save/Unsave post
```

### Stories
```
POST /api/stories/create   → Upload story
GET  /api/stories/feed     → Get all active stories
```

### Chat
```
POST /api/messages/send         → Send message
GET  /api/messages/:conversationId → Get chat history
```

---

## 🔴 Common Issues & Fixes

| Problem | Fix |
|---|---|
| App can't connect to backend | Check IP in `.env` matches your PC's IPv4 |
| MongoDB not connecting | Check MONGO_URI + whitelist your IP in Atlas |
| Expo QR not working | Make sure phone + PC are on same WiFi |
| Images not uploading | Check Cloudinary keys in `.env` |
| `node_modules` error | Delete folder → run `npm install` again |

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Multer, Cloudinary, Socket.io

**Frontend:** React Native, Expo, React Navigation, Axios, Context API, AsyncStorage, Expo Image Picker, Expo Video, Expo Notifications

---

## 👤 Author

Priya G — [GitHub](https://github.com/priyagowda11)

---

*Built with ❤️ using React Native + Node.js*
