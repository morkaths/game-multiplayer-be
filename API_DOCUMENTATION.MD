# API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Questions](#questions)
- [Question Sets](#question-sets)
- [Answers](#answers)
- [Rooms](#rooms)
- [Players](#players)
- [Player Answers](#player-answers)
- [Real-time Events (Socket.IO)](#real-time-events)
- [Error Codes](#error-codes)

## Authentication
### Register
```http
POST /api/auth/register
```
**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "username": "string",
    "email": "string",
    "token": "string"
  }
}
```

### Login
```http
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "token": "string",
    "user": {
      "id": "number",
      "username": "string",
      "email": "string"
    }
  }
}
```

## Users
### Get User Profile
```http
GET /api/users/profile
```
**Headers:**
```
Authorization: Bearer {token}
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "username": "string",
    "email": "string",
    "avatar_url": "string"
  }
}
```

### Update User Profile
```http
PUT /api/users/profile
```
**Headers:**
```
Authorization: Bearer {token}
```
**Request Body (multipart/form-data):**
```
username: string
email: string
avatar: File (optional)
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "username": "string",
    "email": "string",
    "avatar_url": "string"
  }
}
```

## Questions
### Create Question
```http
POST /api/questions
```
**Headers:**
```
Authorization: Bearer {token}
```
**Request Body (multipart/form-data):**
```
title: string
type: "choice" | "text"
image: File (optional)
points: number
time_limit: number
question_set_id: number
```
**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "title": "string",
    "type": "string",
    "image_url": "string",
    "points": "number",
    "time_limit": "number"
  }
}
```

### Get All Questions
```http
GET /api/questions
```
**Query Parameters:**
```
question_set_id: number (optional)
page: number (optional, default: 1)
limit: number (optional, default: 10)
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "questions": [{
      "id": "number",
      "title": "string",
      "type": "string",
      "image_url": "string",
      "points": "number",
      "time_limit": "number"
    }],
    "pagination": {
      "total": "number",
      "pages": "number",
      "current_page": "number",
      "limit": "number"
    }
  }
}
```

### Get Question By ID
```http
GET /api/questions/:id
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "title": "string",
    "type": "string",
    "image_url": "string",
    "points": "number",
    "time_limit": "number",
    "answers": [{
      "id": "number",
      "text": "string",
      "is_correct": "boolean"
    }]
  }
}
```

### Update Question
```http
PUT /api/questions/:id
```
**Request Body (multipart/form-data):**
```
title: string
type: "choice" | "text"
image: File (optional)
points: number
time_limit: number
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "title": "string",
    "type": "string",
    "image_url": "string",
    "points": "number",
    "time_limit": "number"
  }
}
```

### Delete Question
```http
DELETE /api/questions/:id
```
**Response (200):**
```json
{
  "status": "success",
  "message": "Question deleted successfully"
}
```

## Question Sets
### Create Question Set
```http
POST /api/question-sets
```
**Headers:**
```
Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "title": "string",
  "description": "string"
}
```
**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "title": "string",
    "description": "string",
    "created_by": "number"
  }
}
```

### Get All Question Sets
```http
GET /api/question-sets
```
**Query Parameters:**
```
page: number (optional, default: 1)
limit: number (optional, default: 10)
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "question_sets": [{
      "id": "number",
      "title": "string",
      "description": "string",
      "created_by": "number",
      "questions_count": "number"
    }],
    "pagination": {
      "total": "number",
      "pages": "number",
      "current_page": "number",
      "limit": "number"
    }
  }
}
```

### Get Question Set By ID
```http
GET /api/question-sets/:id
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "title": "string",
    "description": "string",
    "created_by": "number",
    "questions": [{
      "id": "number",
      "title": "string",
      "type": "string"
    }]
  }
}
```

### Update Question Set
```http
PUT /api/question-sets/:id
```
**Request Body:**
```json
{
  "title": "string",
  "description": "string"
}
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "title": "string",
    "description": "string"
  }
}
```

### Delete Question Set
```http
DELETE /api/question-sets/:id
```
**Response (200):**
```json
{
  "status": "success",
  "message": "Question set deleted successfully"
}
```
## Answers
### Create Answer
```http
POST /api/answers
```
**Headers:**
```
Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "question_id": "number",
  "text": "string",
  "is_correct": "boolean"
}
```
**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "question_id": "number",
    "text": "string",
    "is_correct": "boolean"
  }
}
```
### Get ALL Answers by Question_ID
```http
GET /api/answers?question_id=number
```
**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "number",
      "question_id": "number",
      "text": "string",
      "is_correct": "boolean"
    }
  ]
}
```
### Get Answer By ID
```http
GET /api/answers/:id
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "question_id": "number",
    "text": "string",
    "is_correct": "boolean"
  }
}
```
### Update Answer
```http
PUT /api/answers/:id
```
**Headers:**
```
Authorization: Bearer {token}
```
**Request Body**:
```json
{
  "text": "string",
  "is_correct": "boolean"
}
```
**Response(200)**:
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "question_id": "number",
    "text": "string",
    "is_correct": "boolean"
  }
}
```
### Delete Answer
```
DELETE /api/answers/:id
```
**Headers:**
```
Authorization: Bearer {token}
```
**Response(200)**:
```json
{
  "status": "success",
  "message": "Answer deleted successfully"
}
```
## Rooms
### Get All Rooms
```http
GET /api/rooms
```
**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "number",
      "pin": "string",
      "title": "string",
      "status": "waiting" | "playing" | "ended",
      "host_id": "number",
      "question_set_id": "number"
    }
  ]
}
```
### Get Room By ID
```http
GET /api/rooms/:id
```
**Response (200):**
```json 
{
  "status": "success",
  "data": {
    "id": "number",
    "pin": "string",
    "title": "string",
    "status": "waiting" | "playing" | "ended",
    "host_id": "number",
    "question_set_id": "number"
  }
}
```
### Update Room
```http
PUT /api/rooms/:id
```
**Headers:**
```
Authorization: Bearer {token}
```
**Request Body:**
```json 
{
  "title": "string",
  "status": "waiting" | "playing" | "ended"
}
```
**Response (200):**
```json 
{
  "status": "success",
  "data": {
    "id": "number",
    "pin": "string",
    "title": "string",
    "status": "waiting" | "playing" | "ended",
    "host_id": "number",
    "question_set_id": "number"
  }
}
```
### Delete Room
```http
DELETE /api/rooms/:id
```
**Headers:**
```
Authorization: Bearer {token}
```
**Response (200):**
```json 
{
  "status": "success",
  "message": "Room deleted successfully"
}
```
## Players
### Create Player
```http
POST /api/players
```
**Request Body:**
```json
{
  "room_id": "number",
  "nickname": "string",
  "avatar_url": "string"
}
```
**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "room_id": "number",
    "nickname": "string",
    "avatar_url": "string",
    "score": "number"
  }
}
```
### Get All Players (in a room)
```http
GET /api/players?room_id=number
```
**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "number",
      "room_id": "number",
      "nickname": "string",
      "avatar_url": "string",
      "score": "number"
    }
  ]
}
```
Get Player By ID
```http
GET /api/players/:id
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "room_id": "number",
    "nickname": "string",
    "avatar_url": "string",
    "score": "number"
  }
}
```
### Update Player
```http
PUT /api/players/:id
```
**Request Body:**
```json
{
  "nickname": "string",
  "avatar_url": "string",
  "score": "number"
}
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "room_id": "number",
    "nickname": "string",
    "avatar_url": "string",
    "score": "number"
  }
}
```
### Delete Player
```http
DELETE /api/players/:id
```
**Response (200):**
```json
{
  "status": "success",
  "message": "Player deleted successfully"
}
```
## Player Answers
### Create Player Answer

```http
POST /api/player-answers
```
**Request Body:**
```json
{
  "player_id": "number",
  "question_id": "number",
  "answer_id": "number",
  "is_correct": "boolean",
  "response_time": "number",
  "points": "number"
}
```
**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "player_id": "number",
    "question_id": "number",
    "answer_id": "number",
    "is_correct": "boolean",
    "response_time": "number",
    "points": "number"
  }
}
```
Get All Player Answers (by player or question)
```http
GET /api/player-answers?player_id=number&question_id=number
```
**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "number",
      "player_id": "number",
      "question_id": "number",
      "answer_id": "number",
      "is_correct": "boolean",
      "response_time": "number",
      "points": "number"
    }
  ]
}
```
Get Player Answer By ID
```http
GET /api/player-answers/:id
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "player_id": "number",
    "question_id": "number",
    "answer_id": "number",
    "is_correct": "boolean",
    "response_time": "number",
    "points": "number"
  }
}
```
### Update Player Answer
```http
PUT /api/player-answers/:id
```
**Request Body:**
```json
{
  "answer_id": "number",
  "is_correct": "boolean",
  "response_time": "number",
  "points": "number"
}
```
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "number",
    "player_id": "number",
    "question_id": "number",
    "answer_id": "number",
    "is_correct": "boolean",
    "response_time": "number",
    "points": "number"
  }
}
```
### Delete Player
```http
DELETE /api/player-answers/:id
```
**Response (200):**
```json
{
  "status": "success",
  "message": "Player answer deleted successfully"
}
```
