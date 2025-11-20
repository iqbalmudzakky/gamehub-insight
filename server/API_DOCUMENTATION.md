# API Documentation

Base URL: `http://localhost:3000`

---

## Authentication Routes

### POST /auth/register

**Description:** Register a new user account.

**Headers:** None

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

### POST /auth/login

**Description:** Login with email and password.

**Headers:** None

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### POST /auth/google

**Description:** Login using Google OAuth.

**Headers:** None

**Body:**

```json
{
  "googleToken": "google_oauth_token_here"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@gmail.com",
      "role": "user"
    }
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid Google token"
}
```

---

### GET /auth/profile

**Description:** Get current user profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Unauthorized - Invalid token"
}
```

---

### POST /auth/logout

**Description:** Logout current user.

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Game Routes

### GET /games

**Description:** Get all games with optional filtering, search, and pagination.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters (all optional):**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `genre` - Filter by genre
- `platform` - Filter by platform
- `q` - Search in title

**Success Response (200):**

```json
{
  "success": true,
  "message": "Games retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Game Title",
      "genre": "Action",
      "platform": "PC",
      "publisher": "Publisher Name",
      "thumbnail": "https://example.com/image.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10
  }
}
```

---

### GET /games/:id

**Description:** Get detailed information about a specific game.

**Headers:**

```
Authorization: Bearer <token>
```

**Params:**

- `id` - Game ID (integer)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Game Title",
    "genre": "Action",
    "platform": "PC",
    "publisher": "Publisher Name",
    "thumbnail": "https://example.com/image.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Game not found"
}
```

---

### PUT /games/:id

**Description:** Update game details (admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Params:**

- `id` - Game ID (integer)

**Body:**

```json
{
  "title": "Updated Title",
  "genre": "RPG",
  "platform": "PlayStation",
  "publisher": "New Publisher",
  "thumbnail": "https://example.com/new-image.jpg",
  "createdAt": "2025-01-01"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Game updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Title",
    "genre": "RPG",
    "platform": "PlayStation",
    "publisher": "New Publisher",
    "thumbnail": "https://example.com/new-image.jpg"
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "Forbidden - Admin access required"
}
```

---

## Favorite Routes

### GET /favorites

**Description:** Get all favorites for the current user.

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User's favorite list successfully retrieved",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "gameId": 5,
      "Game": {
        "id": 5,
        "title": "Favorite Game",
        "genre": "Action",
        "platform": "PC",
        "thumbnail": "https://example.com/image.jpg"
      }
    }
  ]
}
```

---

### POST /favorites/:gameId

**Description:** Add a game to user's favorites.

**Headers:**

```
Authorization: Bearer <token>
```

**Params:**

- `gameId` - Game ID (integer)

**Success Response (201):**

```json
{
  "success": true,
  "message": "Game added to favorites",
  "data": {
    "id": 1,
    "userId": 1,
    "gameId": 5
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Game already in favorites"
}
```

---

### DELETE /favorites/:gameId

**Description:** Remove a game from user's favorites.

**Headers:**

```
Authorization: Bearer <token>
```

**Params:**

- `gameId` - Game ID (integer)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Game removed from favorites"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Favorite not found"
}
```

---

## AI Routes

### GET /ai/recommend

**Description:** Get personalized game recommendations based on user's favorites using AI.

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "AI recommendations generated successfully",
  "data": {
    "recommendations": [
      {
        "title": "Recommended Game 1",
        "reason": "Based on your favorite Action games"
      },
      {
        "title": "Recommended Game 2",
        "reason": "Similar to your favorites"
      }
    ],
    "cached": false
  }
}
```

**Error Response (500):**

```json
{
  "success": false,
  "message": "AI service temporarily unavailable"
}
```

---

### GET /ai/history

**Description:** Get user's AI recommendation history.

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "request": "favorite games analysis",
      "response": "Based on your favorites...",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### DELETE /ai/history/:id

**Description:** Delete a specific AI request from history.

**Headers:**

```
Authorization: Bearer <token>
```

**Params:**

- `id` - AI Request ID (integer)

**Success Response (200):**

```json
{
  "success": true,
  "message": "AI request deleted successfully"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "AI request not found"
}
```

---

## Error Responses

All endpoints may return these common errors:

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "message": "Forbidden - Insufficient permissions"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Notes

- All authenticated routes require `Authorization: Bearer <token>` header
- Token is obtained from `/auth/login`, `/auth/register`, or `/auth/google`
- Admin routes require user role to be "admin"
- All responses follow the format: `{ success: boolean, message?: string, data?: any }`
