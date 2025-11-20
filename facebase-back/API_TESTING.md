# API Testing Guide

## 🔐 Authentication

The API uses two authentication methods:

### 1. Admin Token (For Testing)
Use the `ADMIN_TOKEN` from your `.env` file:

```bash
Authorization: Bearer test-admin-token-12345
```

### 2. Telegram WebApp Authentication
Real Telegram Mini App tokens with signature verification (for production).

---

## 📝 Testing Endpoints with Admin Token

### Health Check (No Auth Required)
```bash
curl http://localhost:5001/
```

Expected response:
```json
{"success":true,"message":"Server is running!"}
```

---

## 👤 Profile Endpoints

### 1. Create Profile
```bash
curl -X POST http://localhost:5001/api/profiles \
  -H "Authorization: Bearer test-admin-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe"
  }'
```

### 2. Get Profile by Telegram ID
```bash
curl -X GET http://localhost:5001/api/profiles/123456789 \
  -H "Authorization: Bearer test-admin-token-12345"
```

### 3. Update Profile
```bash
curl -X PUT http://localhost:5001/api/profiles/123456789 \
  -H "Authorization: Bearer test-admin-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio",
    "skills": ["JavaScript", "TypeScript", "React"]
  }'
```

### 4. Get All Profiles
```bash
curl -X GET http://localhost:5001/api/profiles \
  -H "Authorization: Bearer test-admin-token-12345"
```

---

## 📺 Channel Endpoints

### 1. Create Channel
```bash
curl -X POST http://localhost:5001/api/channels \
  -H "Authorization: Bearer test-admin-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "channelName": "My Channel",
    "channelId": "@mychannel",
    "subscribersCount": 1000,
    "category": "Tech"
  }'
```

### 2. Get Channels by Telegram ID
```bash
curl -X GET http://localhost:5001/api/channels/123456789 \
  -H "Authorization: Bearer test-admin-token-12345"
```

---

## 🚀 Project Endpoints

### 1. Create Project
```bash
curl -X POST http://localhost:5001/api/projects \
  -H "Authorization: Bearer test-admin-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Campaign",
    "description": "Marketing campaign for product launch",
    "category": "Marketing",
    "budget": 5000,
    "telegramId": "123456789"
  }'
```

### 2. Get All Projects
```bash
curl -X GET http://localhost:5001/api/projects \
  -H "Authorization: Bearer test-admin-token-12345"
```

### 3. Get Project by ID
```bash
curl -X GET http://localhost:5001/api/projects/{project_id} \
  -H "Authorization: Bearer test-admin-token-12345"
```

### 4. Update Project
```bash
curl -X PUT http://localhost:5001/api/projects/{project_id} \
  -H "Authorization: Bearer test-admin-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "budget": 6000
  }'
```

---

## 💼 Proposal Endpoints

### 1. Create Proposal
```bash
curl -X POST http://localhost:5001/api/proposals \
  -H "Authorization: Bearer test-admin-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "{project_id}",
    "channelId": "{channel_id}",
    "telegramId": "123456789",
    "message": "I would like to work on this project",
    "price": 1000
  }'
```

### 2. Get Proposals for Project
```bash
curl -X GET http://localhost:5001/api/proposals/project/{project_id} \
  -H "Authorization: Bearer test-admin-token-12345"
```

### 3. Update Proposal Status
```bash
curl -X PUT http://localhost:5001/api/proposals/{proposal_id} \
  -H "Authorization: Bearer test-admin-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted"
  }'
```

---

## 💰 Wallet Endpoints

### 1. Get Wallet
```bash
curl -X GET http://localhost:5001/api/wallet/123456789 \
  -H "Authorization: Bearer test-admin-token-12345"
```

### 2. Update Wallet Balance
```bash
curl -X POST http://localhost:5001/api/wallet/123456789/balance \
  -H "Authorization: Bearer test-admin-token-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "type": "deposit"
  }'
```

---

## 📤 Upload Endpoints

### Upload File
```bash
curl -X POST http://localhost:5001/api/upload \
  -H "Authorization: Bearer test-admin-token-12345" \
  -F "file=@/path/to/your/file.jpg"
```

---

## 🧪 Using Postman or Thunder Client

### Setup
1. Create a new request
2. Add header:
   - **Key**: `Authorization`
   - **Value**: `Bearer test-admin-token-12345`
3. Set the request URL and method
4. For POST/PUT requests, add JSON body

### Example Collection Structure
```
Facebase API
├── Profiles
│   ├── Create Profile (POST)
│   ├── Get Profile (GET)
│   ├── Update Profile (PUT)
│   └── List Profiles (GET)
├── Channels
│   ├── Create Channel (POST)
│   └── Get Channels (GET)
├── Projects
│   ├── Create Project (POST)
│   ├── List Projects (GET)
│   └── Update Project (PUT)
└── Proposals
    ├── Create Proposal (POST)
    └── List Proposals (GET)
```

---

## 🔍 Debugging Tips

### Check if App is Running
```bash
docker-compose ps
```

### View Real-Time Logs
```bash
docker-compose logs -f app
```

### Test MongoDB Connection
```bash
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin facebase --eval "db.getCollectionNames()"
```

### Check Environment Variables
```bash
docker-compose exec app printenv | grep -E "(ADMIN_TOKEN|MONGO_URI|PORT)"
```

---

## ⚠️ Common Errors

### Error: "Authorization header missing or invalid"
**Solution**: Make sure you include the Authorization header:
```bash
-H "Authorization: Bearer test-admin-token-12345"
```

### Error: "Cannot read properties of undefined"
**Solution**: Check that all required fields are included in your request body.

### Error: Connection refused
**Solution**: Make sure the app is running:
```bash
docker-compose ps
docker-compose logs app
```

---

## 🔐 Security Notes

⚠️ **IMPORTANT**: 
- The `ADMIN_TOKEN` is only for development/testing
- In production, remove or change the `ADMIN_TOKEN` to a secure value
- Real clients should use Telegram WebApp authentication
- Never commit `.env` files with real tokens

---

## 📋 Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/profiles` | POST | Create profile |
| `/api/profiles/:id` | GET | Get profile |
| `/api/profiles` | GET | List all profiles |
| `/api/channels` | POST | Create channel |
| `/api/channels/:telegramId` | GET | Get user channels |
| `/api/projects` | POST | Create project |
| `/api/projects` | GET | List projects |
| `/api/projects/:id` | PUT | Update project |
| `/api/proposals` | POST | Create proposal |
| `/api/wallet/:telegramId` | GET | Get wallet |
| `/api/upload` | POST | Upload file |
| `/admin` | GET | Admin panel (browser) |

---

**Last Updated**: November 13, 2024  
**Base URL**: http://localhost:5001


