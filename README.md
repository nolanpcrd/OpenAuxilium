# OpenAuxilium

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-blue.svg)](https://www.ecma-international.org/)

**USE LOCAL AI EVERYWHERE !!**

**OpenAuxilium** is a complete AI-powered chatbot solution that enables you to deploy local AI chat assistants on any website. It consists of a powerful Node.js server that runs local LLaMA models and a lightweight JavaScript widget for seamless website integration.

## 🌟 Overview

OpenAuxilium provides everything you need to add intelligent chat capabilities to your website:

- **🖥️ Server**: A robust Node.js backend that runs local AI models using LLaMA C++ bindings
- **🎨 Plugin**: A plug-and-play JavaScript widget that works on any website
- **🤖 Local AI**: Complete privacy with local model inference (no external API calls)
- **📊 Multi-user**: Handles multiple concurrent conversations with session management

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/OpenAuxilium.git
cd OpenAuxilium
```

### 2. Setup the Server

```bash
cd server
npm install

# Download AI model
./init

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start server
npm start
```

### 3. Integrate the Plugin

```html
<!-- Add to your website -->
<script src="auxilium-plugin/auxilium.js"></script>
<script>
  OpenAuxilium.init({
    serverUrl: 'http://localhost:3000',
    title: 'AI Assistant',
    theme: 'light'
  });
</script>
```

That's it! Your AI chat assistant is now live on your website.

## 📁 Project Structure

```
OpenAuxilium/
├── server/                     # Backend server
│   ├── AI/                     # AI implementation
│   │   ├── RunAI.js           # Abstract AI interface
│   │   ├── RunAILlamaCpp.js   # LLaMA C++ implementation
│   │   └── model.gguf         # AI model file (downloaded)
│   ├── API/                    # REST API routes
│   │   ├── chatRoutes.js      # Chat endpoints
│   │   └── middleware.js      # Express middleware
│   ├── server.js              # Main server file
│   ├── package.json           # Server dependencies
│   ├── .env                   # Environment configuration
│   └── README.md              # Server documentation
│
├── auxilium-plugin/           # Frontend widget
│   ├── src/                   # Source files
│   │   ├── ChatAPI.js         # Server communication
│   │   ├── ChatManager.js     # Chat state management
│   │   ├── ChatUI.js          # User interface
│   │   └── styles.css         # Widget styles
│   ├── examples/              # Integration examples
│   │   └── basic.html         # Basic usage example
│   ├── auxilium.js            # Compiled plugin
│   └── README.md              # Plugin documentation
│
└── README.md                  # This file
```

## ✨ Key Features

### 🤖 Local AI Processing
- **Privacy First**: All AI processing happens locally on your server
- **LLaMA Models**: Support for GGUF format models from Hugging Face
- **Custom System Roles**: Configure your AI's personality and behavior
- **No External Dependencies**: No need for OpenAI API or other external services
- **Completly free to use**: No API keys or usage limits

### 💬 Multi-User Chat
- **Session Management**: Handle multiple users simultaneously
- **Queue System**: Efficient processing of concurrent requests
- **Auto Cleanup**: Automatic removal of inactive sessions
- **Conversation History**: Maintain context across messages

### 🎨 Easy Integration
- **Plug & Play**: Single script inclusion, zero dependencies
- **Responsive Design**: Works on desktop and mobile devices
- **Customizable Themes**: Light and dark modes with custom styling
- **Multiple Positions**: Place widget anywhere on your page

### 🔧 Developer Friendly
- **RESTful API**: Clean, documented API endpoints
- **Configuration**: Extensive customization options
- **Debug Mode**: Detailed logging for troubleshooting
- **TypeScript Ready**: Full type definitions included

## 🎯 Use Cases

### 🛒 E-commerce Support
- Product recommendations and information
- Order tracking and support
- FAQ automation
- Customer service

### 📚 Documentation Assistant
- Help users navigate complex documentation
- Answer technical questions
- Provide code examples
- Guide new users

### 🏢 Business Websites
- Lead qualification
- Service information
- Appointment scheduling
- General inquiries

### 🎓 Educational Platforms
- Student support
- Course guidance
- Assignment help
- Resource recommendations

**Don't hesitate to modify the code to fit your specific needs! OpenAuxilium is designed to be flexible and adaptable for any use case.**

## 📊 API Overview

The server provides a comprehensive REST API:

### Session Management
```bash
POST   /api/chat/sessions              # Create new session
DELETE /api/chat/sessions/:id          # Delete session
GET    /api/chat/sessions/:id/history  # Get conversation history
```

### Messaging
```bash
POST   /api/chat/sessions/:id/messages # Send message
```

### System Management
```bash
GET    /api/chat/status                # Server status
POST   /api/chat/cleanup               # Clean inactive sessions
GET    /api/chat/system-role           # Get AI system role
PUT    /api/chat/system-role           # Update AI system role
GET    /health                         # Health check
```

## ⚙️ Configuration

### Server Configuration (.env)
```env
# Server settings
PORT=3000
NODE_ENV=production

# AI Model
HUGGINGFACE_MODEL_URL=https://huggingface.co/model-url
MODEL_NAME=model.gguf
AI_SYSTEM_ROLE=You are a helpful assistant...

# Security
ALLOWED_ORIGINS=https://yoursite.com,https://www.yoursite.com
```

### Plugin Configuration
```javascript
OpenAuxilium.init({
  serverUrl: 'https://your-server.com',
  title: 'AI Assistant',
  theme: 'light',                    // 'light' or 'dark'
  position: 'bottom-right',          // 'bottom-right', 'bottom-left', etc.
  welcomeMessage: 'Hello! How can I help?',
  placeholder: 'Type your message...',
  autoOpen: false,                   // Auto-open on page load
  debug: false                       // Enable debug logging
});
```

## 🔧 Development

### Server Development
```bash
cd server
npm install
npm run dev          # Development mode with auto-reload
npm run init         # Download AI model
npm start            # Production mode
```

### Plugin Development
```bash
cd auxilium-plugin
# Edit source files in src/
# Plugin automatically builds to auxilium.js
```

### Testing
```bash
# Start server
cd server && npm start

# Open example in browser
open auxilium-plugin/examples/basic.html
```

## 📦 Deployment

### Server Deployment
1. Set up Node.js environment (18+)
2. Clone repository and install dependencies
3. Configure environment variables
4. Download AI model with `./init`
5. Start with `npm start`

### Plugin Deployment
1. Upload `auxilium-plugin/` folder to your web server
2. Include script in your HTML
3. Configure with your server URL

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/ .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔐 Security Considerations

- **HTTPS Required**: Always use HTTPS in production
- **CORS Configuration**: Properly configure allowed origins
- **Rate Limiting**: Consider implementing rate limiting
- **Input Validation**: Server validates all inputs
- **Session Security**: Sessions are automatically cleaned up

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🙏 Acknowledgments

- [node-llama-cpp](https://github.com/withcatai/node-llama-cpp) for LLaMA integration
- [Hugging Face](https://huggingface.co/) for model hosting
- The open-source AI community for model development

## 📞 Support

- **Documentation**: Check the README files in `server/` and `auxilium-plugin/`
- **Examples**: See the `examples/` folder for integration samples
- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join our community discussions

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

---

**Long live local AI !**
