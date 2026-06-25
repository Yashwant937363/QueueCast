# QueueCast 🎵

> **Real-Time Collaborative Music Queue Platform**

QueueCast is a web application that lets groups of people collaboratively build and control a shared music queue. Create a room, invite friends via QR code, search for songs from YouTube or JioSaavn, add them to the queue, and let everyone vote on what plays next — the song with the most votes gets played first.

---

## ✨ Features

| Feature                     | Description                                                               |
| --------------------------- | ------------------------------------------------------------------------- |
| **Collaborative Rooms**     | Create public or private rooms with customizable member limits            |
| **Real-Time Sync**          | WebSocket-powered live updates for queue, playback state, and connections |
| **Vote-Based Queue**        | Songs are sorted by likes; the most-liked song plays next                 |
| **Dual Music Sources**      | Search and play from **YouTube** (via iframe API) and **JioSaavn**        |
| **Master Time Sync**        | Room owner controls playback; all clients sync to the master's timeline   |
| **QR Code Sharing**         | Generate a QR code for any room to invite others instantly                |
| **Auth0 Authentication**    | Secure login via Auth0 with Google/GitHub/Email social login              |
| **Multi-Platform UI**       | Fully responsive design with dedicated mobile player bar                  |
| **Real-Time Notifications** | Toast-style notifications for join/leave/song-added events                |

---

## 🏗 Architecture Overview

QueueCast follows an event-driven architecture built around WebSockets and Redis Pub/Sub to keep all connected users synchronized in real time. The frontend communicates with the backend through both REST APIs and persistent WebSocket connections, while Redis acts as the central state store and event bus.

```text
┌─────────────────────────────────────────────────────────────┐
│                       CLIENTS                               │
│                                                             │
│  React + TypeScript + Redux + Auth0                         │
│                                                             │
│  • Room Management                                          │
│  • Music Search (YouTube / JioSaavn)                        │
│  • Real-Time Queue Updates                                  │
│  • Playback Synchronization                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                REST API / WebSocket
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    GO + GIN BACKEND                         │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐   │
│  │ Auth Layer  │   │ REST API     │   │ WebSocket Hub   │   │
│  │ (JWT/Auth0) │   │ Handlers     │   │ Client Manager  │   │
│  └─────────────┘   └──────────────┘   └────────┬────────┘   │
│                                                 │           │
└─────────────────────────────────────────────────┼───────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     REDIS LAYER                             │
│                                                             │
│  • Room State                                               │
│  • Song Queues                                              │
│  • Likes & Votes                                            │
│  • Currently Playing Track                                  │
│  • Pub/Sub Event Bus                                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  POSTGRESQL DATABASE                        │
│                                                             │
│  • User Profiles                                            │
│  • Authentication Metadata                                  │
│  • Persistent User Data                                     │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

```text
User Action
     │
     ▼
Frontend (React)
     │
     ▼
WebSocket / REST
     │
     ▼
Backend (Go + Gin)
     │
     ▼
Redis State Update
     │
     ▼
Redis Pub/Sub Event
     │
     ▼
WebSocket Broadcast
     │
     ▼
All Connected Clients Updated
```

### Key Design Decisions

- **Redis as primary state store** — Rooms, song queues, now-playing state, and like sets are all stored in Redis. This enables horizontal scaling since all state is in-memory and shareable across backend instances.
- **Redis Pub/Sub as event bus** — When a song is added, a client joins/leaves, or playback state changes, the event is published to Redis. A subscriber goroutine forwards these events to all connected WebSocket clients in the relevant room.
- **WritePump goroutine per client** — Each WebSocket connection gets a dedicated write goroutine that reads from a buffered channel, ensuring writes happen on a single goroutine to avoid race conditions.
- **Master time synchronization** — The room owner (master) periodically broadcasts their current playback position and timestamp. Non-owner clients use this to keep their UI in sync without needing to control playback themselves.

---

## 🛠 Tech Stack

### Backend

| Technology               | Purpose                             |
| ------------------------ | ----------------------------------- |
| **Go 1.25**              | Language                            |
| **Gin**                  | HTTP framework & routing            |
| **gorilla/websocket**    | WebSocket implementation            |
| **go-redis**             | Redis client                        |
| **pgx v5**               | PostgreSQL driver (connection pool) |
| **Auth0 JWT Middleware** | JWT validation with JWKS caching    |
| **godotenv**             | Environment variable loading        |

### Frontend

| Technology          | Purpose                    |
| ------------------- | -------------------------- |
| **React 19**        | UI framework               |
| **TypeScript**      | Type safety                |
| **Vite 8**          | Build tool & dev server    |
| **Redux Toolkit**   | State management           |
| **Tailwind CSS 4**  | Utility-first styling      |
| **lucide-react**    | Icon library               |
| **motion**          | Animations (Framer Motion) |
| **Auth0 React SDK** | Authentication             |
| **youtube-player**  | YouTube iframe API wrapper |

### Data Stores

| Store          | Usage                                                          |
| -------------- | -------------------------------------------------------------- |
| **PostgreSQL** | Persistent user accounts                                       |
| **Redis**      | Room state, song queues, likes, now-playing, pub/sub event bus |

---

## 🗄 Database Schema

### PostgreSQL — `users` table

| Column       | Type      | Description              |
| ------------ | --------- | ------------------------ |
| `id`         | UUID (PK) | Auto-generated user ID   |
| `username`   | VARCHAR   | Display name             |
| `email`      | VARCHAR   | Email address (unique)   |
| `picture`    | TEXT      | Profile picture URL      |
| `auth0_id`   | VARCHAR   | Auth0 subject identifier |
| `created_at` | TIMESTAMP | Account creation time    |

### Redis Key Structure

| Key Pattern                         | Type          | Description                              |
| ----------------------------------- | ------------- | ---------------------------------------- |
| `room:{roomId}`                     | String (JSON) | Full room object (owner, clients, songs) |
| `rooms`                             | Set           | Set of all room IDs                      |
| `room:{roomId}:now-playing`         | String (JSON) | Currently playing song + master time     |
| `room:{roomId}:song:{songId}:likes` | Set           | Set of Auth0 IDs who liked this song     |
| `logincache:{token}`                | String (JSON) | Temporary login cache (30s TTL)          |

---

## 🌐 REST API

| Method | Endpoint          | Auth       | Description                                 |
| ------ | ----------------- | ---------- | ------------------------------------------- |
| `POST` | `/api/auth/login` | Bearer JWT | Authenticate/sync user; creates user if new |
| `POST` | `/api/room`       | Bearer JWT | Create a new room                           |
| `GET`  | `/api/rooms`      | None       | List all rooms (public + private)           |
| `GET`  | `/ws`             | None       | WebSocket upgrade endpoint                  |

---

## 🔌 WebSocket Protocol

All real-time communication happens over a single WebSocket connection at `/ws`. Messages follow a JSON envelope format:

```json
{
  "event": "event-name",
  "message": { ... }
}
```

### Client → Server Events

| Event                 | Payload                                                   | Description                        |
| --------------------- | --------------------------------------------------------- | ---------------------------------- |
| `join-room`           | `{ auth0Id, roomId, username, picture }`                  | Join a room (adds client to Redis) |
| `leave-room`          | `{}`                                                      | Leave current room                 |
| `add-song`            | `{ id, url, name, picture, source, likes }`               | Add a song to the queue            |
| `song-liked`          | `{ songId, isLiked }`                                     | Like or unlike a song              |
| `next-song`           | `{ roomId }`                                              | Request next song (owner only)     |
| `current-song`        | `{ roomId }`                                              | Request currently playing song     |
| `update-master-time`  | `{ roomId, masterTime: { currentTime, date, duration } }` | Sync playback position             |
| `update-player-state` | `{ playing }`                                             | Toggle play/pause                  |
| `clear-now-playing`   | `{}`                                                      | Clear current song state           |

### Server → Client Events

| Event                 | Payload                                      | Description                               |
| --------------------- | -------------------------------------------- | ----------------------------------------- |
| `room-joined`         | `{ room, message }`                          | Confirmation with full room state         |
| `client-joined`       | `{ client: { auth0Id, username, picture } }` | A new client joined the room              |
| `client-left`         | `{ auth0Id }`                                | A client left the room                    |
| `song-added`          | `{ id, url, name, picture, source, likes }`  | A song was added to the queue             |
| `like-song`           | `{ likes, songId }`                          | Like count changed for a song             |
| `next-song`           | `{ id, url, name, picture, source, likes }`  | Next song is now playing                  |
| `current-song`        | `{ nowPlaying, isNextSong }`                 | Response to current-song request          |
| `update-master-time`  | `{ currentTime, date, duration }`            | Master time sync for non-owners           |
| `update-player-state` | `true/false`                                 | Playback state change                     |
| `new-room`            | `{ room }`                                   | A new room was created (global broadcast) |
| `error`               | `{ title, message, event, data }`            | Error notification                        |

---

## 📁 Project Structure

```
QueueCast/
├── backend/                          # Go backend
│   ├── main.go                       # Entrypoint, Gin router, CORS
│   ├── go.mod / go.sum               # Go module dependencies
│   ├── database/
│   │   ├── myredis/redis.go          # Redis connection + PublishJSON
│   │   └── postgres/
│   │       ├── postgres.go           # PostgreSQL connection pool
│   │       └── user.go               # User CRUD operations
│   ├── handlers/
│   │   ├── auth.go                   # POST /api/auth/login handler
│   │   └── room.go                   # POST /api/room, GET /api/rooms handlers
│   ├── middleware/
│   │   └── auth.go                   # Auth0 JWT validator + GetAuth0ID
│   ├── router/
│   │   └── router.go                 # Route definitions
│   ├── socket/
│   │   ├── socket.go                 # WebSocket upgrade, message dispatch
│   │   ├── events.go                 # Event handler functions
│   │   ├── helpers.go                # Room/Song helpers + send helpers
│   │   ├── pump.go                   # WritePump per-client goroutine
│   │   └── subscriber.go             # Redis Pub/Sub listener
│   ├── structs/
│   │   ├── User.go                   # User struct
│   │   ├── Room.go                   # Room + RoomUser structs
│   │   ├── Song.go                   # Song struct (YouTube/JioSaavn)
│   │   ├── NowPlaying.go             # NowPlaying + MasterTime structs
│   │   ├── Sockets.go                # WebSocket message types + Client struct
│   │   └── PubSub.go                 # Redis Pub/Sub message structs
│   └── utils/
│       └── GenerateSecureID.go       # Crypto-random room ID generator
│
├── frontend/                         # React + Vite frontend
│   ├── index.html
│   ├── vite.config.ts                # Vite config (Tailwind, React plugin)
│   ├── package.json
│   ├── tsconfig.json / tsconfig.*.json
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── main.tsx                   # Entrypoint (Redux Provider + Auth0)
│       ├── App.tsx                    # Router setup (/, /rooms, /room/:id)
│       ├── index.css                  # Tailwind imports + global styles
│       ├── pages/
│       │   ├── Home.tsx               # Landing page with hero + features
│       │   ├── Rooms.tsx              # Room listing (public, private, create)
│       │   ├── Room.tsx               # Room detail (player, queue, search)
│       │   ├── Youtube.tsx            # YouTube search/player dev page
│       │   └── JioSaavan.tsx          # JioSaavn search/player dev page
│       ├── components/
│       │   ├── Navbar.tsx             # Top navigation bar
│       │   ├── NothingSection.tsx     # Empty state placeholder
│       │   ├── Home/HeroMusicFlow.tsx # Animated hero visualization
│       │   ├── room/
│       │   │   ├── MusicPlayer.tsx     # Album art + audio controller
│       │   │   ├── AudioController.tsx # Play/pause, progress bar, time sync
│       │   │   ├── QueueList.tsx       # Song queue display
│       │   │   ├── QueueCard.tsx       # Individual queue item
│       │   │   ├── SearchPanel.tsx     # Full search panel
│       │   │   ├── SearchBar.tsx       # Search input
│       │   │   ├── SearchResults.tsx   # Search results grid
│       │   │   ├── SearchTabs.tsx      # Source tabs (YouTube/JioSaavn)
│       │   │   ├── SongCard.tsx        # Song result card
│       │   │   ├── SongCardSkeleton.tsx# Loading skeleton
│       │   │   ├── TrendingSongs.tsx   # Trending songs section
│       │   │   ├── RoomHeader.tsx      # Room info + QR code share
│       │   │   ├── QRCodeModal.tsx     # QR code sharing modal
│       │   │   ├── MobilePlayerBar.tsx # Bottom player bar (mobile)
│       │   │   └── MobilePlayerModal.tsx # Full-screen mobile player
│       │   ├── Rooms/
│       │   │   ├── CreateRoom.tsx      # Create room form
│       │   │   ├── JoinRoom.tsx        # Join room via code
│       │   │   ├── RoomCard.tsx        # Room preview card
│       │   │   ├── PublicRooms.tsx     # Public room listings
│       │   │   └── RecentRooms.tsx     # Recent rooms section
│       │   └── notifications/
│       │       ├── NotificationCard.tsx    # Toast notification
│       │       └── NotificationContainer.tsx # Notification stack
│       ├── socket/
│       │   ├── socket.ts              # WebSocket connection + event senders
│       │   └── sendEvent.ts           # Low-level message sender
│       ├── store/
│       │   ├── store.ts               # Redux store configuration
│       │   ├── hooks.ts               # Typed Redux hooks
│       │   └── slices/
│       │       ├── UserSlice.ts       # Auth/user state + syncUser thunk
│       │       ├── RoomsSlice.ts      # Room state + real-time reducers
│       │       ├── PlayerSlice.ts     # Player playback state
│       │       └── NotificationSlice.ts # Toast notification state
│       ├── types/
│       │   ├── Song.ts                # Song type
│       │   ├── Room.ts                # Room + RoomUser types
│       │   ├── NowPlaying.ts          # NowPlaying + MasterTime types
│       │   ├── music.ts               # Legacy music types
│       │   ├── YoutubeVideo.ts        # YouTube API response type
│       │   ├── JioSaavnSong.ts        # JioSaavn API response type
│       │   └── store/                 # Redux slice type definitions
│       ├── enums/
│       │   └── Event.ts               # WebSocket event name constants
│       ├── hooks/
│       │   └── useDebounce.ts         # Debounce hook for search inputs
│       ├── data/
│       │   └── dummySongs.ts          # Mock data for development
│       └── utils/
│           ├── notify.ts              # Notification helper
│           └── throttle.ts            # Throttle utility
```

---

## ⚙️ How the Queue Algorithm Works

1. **Adding Songs**: Any room member can search YouTube or JioSaavn and add songs to the room queue. Duplicate detection prevents adding the same song twice.
2. **Voting**: Members can like/unlike songs in the queue. Likes are tracked per-user via Redis Sets (`room:{roomId}:song:{songId}:likes`).
3. **Next Song Selection**: When the owner triggers "next song" (or the current song ends), the backend selects the song with the **highest like count** from the queue:

   ```
   nextSong = argmax_{song in queue}(song.likes)
   ```

4. **Master Time**: The owner's client acts as the "master" — it reports current playback time and position via `update-master-time` WebSocket events. All other clients display this synchronized time without controlling the audio.

---

## 🚀 Getting Started

### Prerequisites

| Tool          | Version         |
| ------------- | --------------- |
| Go            | 1.25+           |
| Node.js       | 20+             |
| PostgreSQL    | 14+             |
| Redis         | 6+              |
| Auth0 Account | Free tier works |

### Environment Variables

#### Backend (`backend/.env`)

| Variable           | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `DB_USER`          | PostgreSQL username                                          |
| `DB_PASSWORD`      | PostgreSQL password                                          |
| `DB_HOST`          | PostgreSQL host                                              |
| `DB_PORT`          | PostgreSQL port                                              |
| `DB_NAME`          | PostgreSQL database name                                     |
| `REDIS_URL`        | Redis connection address (e.g., `localhost:6379`)            |
| `AUTH0_DOMAIN`     | Auth0 issuer URL (e.g., `https://your-tenant.us.auth0.com/`) |
| `AUTH0_IDENTIFIER` | Auth0 API audience identifier                                |

#### Frontend (`frontend/.env.development`)

| Variable                 | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `VITE_SERVER_URL`        | Backend HTTP URL (e.g., `http://localhost:8080`) |
| `VITE_API_SERVER_DOMAIN` | Backend WS domain (e.g., `localhost:8080`)       |
| `VITE_AUTH0_DOMAIN`      | Auth0 tenant domain                              |
| `VITE_AUTH0_CLIENT_ID`   | Auth0 application client ID                      |
| `VITE_YOUTUBE_API_KEY`   | YouTube Data API v3 key                          |

### Running Locally

**1. Start dependencies**

```bash
# PostgreSQL
docker run -d --name postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=queuecast -p 5432:5432 postgres:16

# Redis
docker run -d --name redis -p 6379:6379 redis:7
```

**2. Create PostgreSQL table**

```sql
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    picture TEXT,
    auth0_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**3. Start the backend**

```bash
cd backend
cp .env.example .env   # fill in your values
go run main.go
```

**4. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 🧪 Development Pages

The app includes two standalone development pages for testing music sources:

| Route       | Description                        |
| ----------- | ---------------------------------- |
| `/youtube`  | YouTube search and player sandbox  |
| `/jiosaavn` | JioSaavn search and player sandbox |

---

## 🔗 Related

- Built with [Go](https://go.dev/), [Gin](https://gin-gonic.com/), [gorilla/websocket](https://github.com/gorilla/websocket)
- Frontend powered by [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Redux Toolkit](https://redux-toolkit.js.org/)
- Authentication via [Auth0](https://auth0.com/)
- State persistence with [Redis](https://redis.io/) and [PostgreSQL](https://www.postgresql.org/)

---

## 📄 License

MIT
