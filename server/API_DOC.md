# GameHub Insight API Documentation

**Base URL:** `http://localhost:3000`  
**Version:** 2.0.0  
**Last Updated:** November 11, 2025

---

## Table of Contents

1. [Authentication Overview](#authentication-overview)
2. [Auth Endpoints](#auth-endpoints)
3. [Game Endpoints](#game-endpoints)
4. [Favorite Endpoints](#favorite-endpoints)
5. [AI Recommendation Endpoints](#ai-recommendation-endpoints)
6. [Error Responses](#error-responses)

---

## Authentication Overview

Most endpoints require authentication using JWT (JSON Web Token).

**How to authenticate:**

1. Login or register to receive a token
2. Include the token in the `Authorization` header for protected endpoints:
   ```
   Authorization: Bearer <your-token-here>
   ```

**Token Details:**

- Expires in: 24 hours
- Format: JWT (JSON Web Token)

---

## Auth Endpoints

### 1. Register New User

**Purpose:** Create a new user account with email and password.

- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Authentication:** Not required

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "passwordConfirm": "SecurePass123!"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login

**Purpose:** Login with existing credentials to get an access token.

- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Authentication:** Not required

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Google OAuth Login

**Purpose:** Login or register using Google account credentials.

- **Method:** `POST`
- **Endpoint:** `/auth/google`
- **Authentication:** Not required

**Request Body:**

```json
{
  "GoogleId": "123456789",
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "user": {
      "id": 2,
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Get User Profile

**Purpose:** Retrieve the profile information of the currently logged-in user.

- **Method:** `GET`
- **Endpoint:** `/auth/profile`
- **Authentication:** Required

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 5. Logout

**Purpose:** Logout the current user (client should remove token).

- **Method:** `POST`
- **Endpoint:** `/auth/logout`
- **Authentication:** Required

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logout successful. Please remove token from client."
}
```

---

## Game Endpoints

### 1. Get All Games

**Purpose:** Retrieve all games from the database. Returns complete list for infinite scroll implementation.

- **Method:** `GET`
- **Endpoint:** `/games`
- **Authentication:** Not required

**Response (200):**

```json
{
  "success": true,
  "message": "Games retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "League of Legends",
      "genre": "MOBA",
      "platform": "PC (Windows)",
      "publisher": "Riot Games",
      "thumbnail": "https://example.com/image.jpg",
      "ApiId": 475,
      "createdAt": "2025-11-11T10:30:00Z",
      "updatedAt": "2025-11-11T10:30:00Z"
    }
    // ... more games
  ]
}
```

**Notes:**

- Returns all games without pagination
- Ordered by ID (ascending)
- Frontend should implement infinite scroll

---

### 2. Get Game by ID

**Purpose:** Retrieve detailed information about a specific game using its database ID.

- **Method:** `GET`
- **Endpoint:** `/games/:id`
- **Authentication:** Not required

**URL Parameters:**

- `id` (integer, required): The database ID of the game

**Example:**

```
GET /games/1
```

**Response (200):**

```json
{
  "success": true,
  "message": "Game details retrieved successfully",
  "data": {
    "id": 1,
    "title": "League of Legends",
    "genre": "MOBA",
    "platform": "PC (Windows)",
    "publisher": "Riot Games",
    "thumbnail": "https://example.com/image.jpg",
    "ApiId": 475,
    "createdAt": "2025-11-11T10:30:00Z",
    "updatedAt": "2025-11-11T10:30:00Z",
    "Users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    ]
  }
}
```

**Notes:**

---

### 3. Search Games

**Purpose:** Search and filter games by genre, platform, or keyword.

- **Method:** `GET`
- **Endpoint:** `/games/search`
- **Authentication:** Not required

**Query Parameters:**

- `genre` (string, optional): Filter by genre (case-insensitive)
- `platform` (string, optional): Filter by platform (case-insensitive)
- `keyword` (string, optional): Search in game title (case-insensitive)

**Example:**

```
GET /games/search?genre=MOBA&platform=PC&keyword=league
```

**Response (200):**

```json
{
  "success": true,
  "message": "Game search results",
  "data": [
    {
      "id": 1,
      "title": "League of Legends",
      "genre": "MOBA",
      "platform": "PC (Windows)",
      "publisher": "Riot Games",
      "thumbnail": "https://example.com/image.jpg",
      "ApiId": 475
    }
  ],
  "total": 1
}
```

**Notes:**

- All parameters use case-insensitive partial matching
- Multiple parameters can be combined
- Returns all matching results without limit

---

## Favorite Endpoints

**All favorite endpoints require authentication.**

### 1. Get User Favorites

**Purpose:** Retrieve all games that the current user has marked as favorite.

- **Method:** `GET`
- **Endpoint:** `/favorites`
- **Authentication:** Required

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "User’s favorite list successfully retrieved.",
  "data": [
    {
      "id": 1,
      "UserId": 1,
      "GameId": 1,
      "createdAt": "2025-11-11T10:30:00Z",
      "updatedAt": "2025-11-11T10:30:00Z",
      "Game": {
        "id": 1,
        "title": "League of Legends",
        "genre": "MOBA",
        "platform": "PC (Windows)",
        "publisher": "Riot Games",
        "thumbnail": "https://example.com/image.jpg"
      }
    }
  ],
  "total": 1
}
```

---

### 2. Add Game to Favorites

**Purpose:** Add a specific game to the user's favorites list.

- **Method:** `POST`
- **Endpoint:** `/favorites/:gameId`
- **Authentication:** Required

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `gameId` (integer, required): The database ID of the game to add

**Example:**

```
POST /favorites/1
```

**Response (201):**

```json
{
  "success": true,
  "message": "Game successfully added to favorites",
  "data": {
    "id": 1,
    "UserId": 1,
    "GameId": 1,
    "createdAt": "2025-11-11T10:30:00Z",
    "updatedAt": "2025-11-11T10:30:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Game already exists in favorites list"
}
```

---

### 3. Remove Game from Favorites

**Purpose:** Remove a specific game from the user's favorites list.

- **Method:** `DELETE`
- **Endpoint:** `/favorites/:gameId`
- **Authentication:** Required

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `gameId` (integer, required): The database ID of the game to remove

**Example:**

```
DELETE /favorites/1
```

**Response (200):**

```json
{
  "success": true,
  "message": "Game successfully removed from favorites",
  "data": {
    "GameId": "1",
    "UserId": 1
  }
}
```

---

## AI Recommendation Endpoints

**All AI endpoints require authentication.**

### 1. Get AI Game Recommendation

**Purpose:** Get personalized game recommendations from OpenAI based on user's preferences or questions.

- **Method:** `POST`
- **Endpoint:** `/ai/recommend`
- **Authentication:** Required

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "prompt": "I like action games with great storylines. What do you recommend?"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Game recommendation retrieved successfully",
  "data": {
    "id": 1,
    "prompt": "I like action games with great storylines. What do you recommend?",
    "response": "Based on your preferences, I recommend trying The Witcher 3: Wild Hunt...",
    "createdAt": "2025-11-11T10:30:00Z"
  }
}
```

**Notes:**

- Uses OpenAI GPT-3.5-turbo model
- All requests are saved to database
- Max response tokens: 500

---

### 2. Get AI Request History

**Purpose:** View all previous AI recommendation requests made by the current user.

- **Method:** `GET`
- **Endpoint:** `/ai/history`
- **Authentication:** Required

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (integer, optional, default: 0): Page number for pagination
- `limit` (integer, optional, default: 50): Number of items per page

**Example:**

```
GET /ai/history?page=0&limit=50
```

**Response (200):**

```json
{
  "success": true,
  "message": "AI request history retrieved successfully",
  "data": [
    {
      "id": 1,
      "UserId": 1,
      "prompt": "I like action games with great storylines...",
      "response": "Based on your preferences, I recommend...",
      "createdAt": "2025-11-11T10:30:00Z",
      "updatedAt": "2025-11-11T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 0,
    "limit": 50,
    "totalPages": 1
  }
}
```

---

### 3. Delete AI Request

**Purpose:** Delete a specific AI recommendation request from history.

- **Method:** `DELETE`
- **Endpoint:** `/ai/history/:id`
- **Authentication:** Required

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (integer, required): The ID of the AI request to delete

**Example:**

```
DELETE /ai/history/1
```

**Response (200):**

```json
{
  "success": true,
  "message": "AI request successfully deleted",
  "data": {
    "id": "1"
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "You do not have access to delete this"
}
```

**Notes:**

- Users can only delete their own AI requests
- Authorization check ensures ownership

---

## Error Responses

All API errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes

| Code | Status                | Description                                          |
| ---- | --------------------- | ---------------------------------------------------- |
| 200  | OK                    | Request successful                                   |
| 201  | Created               | Resource created successfully                        |
| 400  | Bad Request           | Invalid input or missing required fields             |
| 401  | Unauthorized          | Authentication failed or token invalid               |
| 403  | Forbidden             | Access denied (valid token, insufficient permission) |
| 404  | Not Found             | Resource not found                                   |
| 500  | Internal Server Error | Server error occurred                                |

### Common Error Examples

**Invalid Token:**

```json
{
  "success": false,
  "message": "Token is invalid or expired"
}
```

**Missing Required Field:**

```json
{
  "success": false,
  "message": "All fields are required"
}
```

**Resource Not Found:**

```json
{
  "success": false,
  "message": "Game not found"
}
```

**Unauthorized Access:**

```json
{
  "success": false,
  "message": "User is not authenticated"
}
```

---

## Testing with cURL

### Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123!","passwordConfirm":"SecurePass123!"}'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'
```

### Get All Games

```bash
curl -X GET http://localhost:3000/games
```

### Add to Favorites

```bash
curl -X POST http://localhost:3000/favorites/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get AI Recommendation

```bash
curl -X POST http://localhost:3000/ai/recommend \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"I like action games with great storylines"}'
```

---

**End of Documentation**
