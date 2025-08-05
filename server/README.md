# OpenAuxilium Server

A local AI chatbot server using LLaMA models with multi-user conversation support.

## Features

- 🤖 Local AI inference using LLaMA models (GGUF format)
- 💬 Multi-user conversation support with session management
- 🔄 Queue-based processing to handle concurrent requests
- 🧹 Automatic cleanup of inactive sessions
- 🚀 RESTful API for easy integration
- 📊 Real-time status monitoring

## Quick Start

### 1. Download and Setup Model

```bash
# Install dependencies
npm install

# Download a model (configure URL in .env)
./init
```

### 2. Configure Environment

Edit `.env` file:
```env
HUGGINGFACE_MODEL_URL=https://huggingface.co/unsloth/gemma-3n-E2B-it-GGUF/resolve/main/gemma-3n-E2B-it-Q4_K_M.gguf
MODEL_NAME=model.gguf
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
AI_SYSTEM_ROLE="You are a helpful assistant. Answer questions and provide information."
```

### 3. Start Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

## API Endpoints

### Session Management

- `POST /api/chat/sessions` - Create new conversation session
- `DELETE /api/chat/sessions/:sessionId` - Delete session

### Messaging

- `POST /api/chat/sessions/:sessionId/messages` - Send message
- `GET /api/chat/sessions/:sessionId/history` - Get conversation history

### Status & Management

- `GET /api/chat/status` - Get server status and queue info
- `POST /api/chat/cleanup` - Clean up inactive sessions
- `GET /health` - Health check endpoint

### System Role Management

- `GET /api/chat/system-role` - Get current AI system role
- `PUT /api/chat/system-role` - Update AI system role

## Usage Examples

### Create Session
```bash
curl -X POST http://localhost:3000/api/chat/sessions \\
  -H "Content-Type: application/json"
```

### Send Message
```bash
curl -X POST http://localhost:3000/api/chat/sessions/{sessionId}/messages \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello, how are you?"}'
```

### Get Status
```bash
curl http://localhost:3000/api/chat/status
```

### System Role Management
```bash
# Get current system role
curl http://localhost:3000/api/chat/system-role

# Update system role
curl -X PUT http://localhost:3000/api/chat/system-role \
  -H "Content-Type: application/json" \
  -d '{"systemRole": "You are a customer support assistant for an e-commerce website. Help users with product questions, orders, and account issues. Stay focused on shopping-related topics."}'
```

## Architecture

- **RunAI Interface**: Abstract interface for AI implementations
- **RunAILlamaCpp**: LLaMA C++ implementation with queue management
- **Queue System**: Ensures single-threaded AI processing
- **Session Management**: Handles multiple concurrent conversations
- **Auto Cleanup**: Removes inactive sessions automatically

## Configuration

Environment variables:
- `PORT`: Server port (default: 3000)
- `MODEL_NAME`: Model filename in ./AI/ directory
- `AI_SYSTEM_ROLE`: Default system role/prompt for the AI
- `CLEANUP_INTERVAL_MINUTES`: Session cleanup interval (default: 30)
- `MAX_SESSION_AGE_MINUTES`: Max session age before cleanup (default: 60)
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Initialize model download
npm run init
```
