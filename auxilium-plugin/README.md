# OpenAuxilium Chat Plugin

A lightweight, plug-and-play chatbot widget for any website. Simply include the script and initialize to add an AI-powered chat assistant to your site.

## 🚀 Features

- **Zero Dependencies**: Pure JavaScript, no external libraries required
- **Plug & Play**: Just include one script and initialize
- **Responsive Design**: Works on desktop and mobile devices
- **Customizable**: Themes, positioning, colors, and messages
- **Multi-session Support**: Handles multiple users seamlessly
- **Auto-cleanup**: Manages inactive sessions automatically
- **Accessibility**: Keyboard navigation and screen reader support

## 📦 Quick Start

### 1. Include the Script

```html
<script src="auxilium-plugin/auxilium.js"></script>
```

### 2. Initialize the Chat

```html
<script>
  OpenAuxilium.init({
    serverUrl: 'http://localhost:3000',
    title: 'Assistant',
    theme: 'light'
  });
</script>
```

That's it! A chat button will appear in the bottom-right corner of your page.

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `serverUrl` | string | `'http://localhost:3000'` | URL of your OpenAuxilium server |
| `title` | string | `'Assistant'` | Title shown in chat header |
| `theme` | string | `'light'` | UI theme (`'light'` or `'dark'`) |
| `position` | string | `'bottom-right'` | Widget position (`'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`) |
| `welcomeMessage` | string | `'Hello! How can I help you today?'` | First message shown to users |
| `placeholder` | string | `'Type your message...'` | Input field placeholder text |
| `autoOpen` | boolean | `false` | Automatically open chat on page load |
| `debug` | boolean | `false` | Enable console logging for debugging |

## 🎨 Usage Examples

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    
    <!-- Your content here -->
    
    <!-- Chat Plugin -->
    <script src="auxilium-plugin/auxilium.js"></script>
    <script>
        OpenAuxilium.init({
            serverUrl: 'https://your-server.com',
            title: 'Support',
            theme: 'light'
        });
    </script>
</body>
</html>
```

### Advanced Configuration

```javascript
OpenAuxilium.init({
    serverUrl: 'https://api.yoursite.com',
    title: 'Customer Support',
    theme: 'dark',
    position: 'bottom-left',
    welcomeMessage: 'Hi there! I\'m here to help with any questions about our products.',
    placeholder: 'Ask me anything about our services...',
    autoOpen: false,
    debug: true
});
```

### Data Attributes (Auto-init)

You can also configure the plugin using data attributes:

```html
<script 
    src="auxilium-plugin/auxilium.js"
    data-server-url="http://localhost:3000"
    data-title="Support Assistant"
    data-theme="dark"
    data-position="bottom-right"
    data-auto-open="false"
    data-debug="true">
</script>
```

## 🔧 API Methods

### Initialization

```javascript
// Initialize the plugin
OpenAuxilium.init(config);

// Check if plugin is ready
if (OpenAuxilium.isReady()) {
    console.log('Chat is ready!');
}

// Get current status
const status = OpenAuxilium.getStatus();
```

### Chat Control

```javascript
// Open chat window
OpenAuxilium.open();

// Close chat window
OpenAuxilium.close();

// Toggle chat window
OpenAuxilium.toggle();

// Send a message programmatically
OpenAuxilium.sendMessage('Hello from JavaScript!');

// Clear chat history
OpenAuxilium.clearHistory();

// Destroy the plugin
OpenAuxilium.destroy();
```

## 🎯 Integration Examples

### E-commerce Site

```javascript
OpenAuxilium.init({
    serverUrl: 'https://chat.mystore.com',
    title: 'Shopping Assistant',
    welcomeMessage: 'Hi! I can help you find products, track orders, or answer questions about our policies.',
    theme: 'light',
    position: 'bottom-right'
});

// Send product recommendations when user views a category
function onCategoryView(category) {
    OpenAuxilium.sendMessage(`I'm looking at ${category} products. Any recommendations?`);
}
```

### SaaS Platform

```javascript
OpenAuxilium.init({
    serverUrl: 'https://support.mysaas.com',
    title: 'Help Center',
    welcomeMessage: 'Need help getting started? I can guide you through setup and answer questions.',
    theme: 'dark',
    position: 'bottom-right',
    debug: process.env.NODE_ENV === 'development'
});
```

### Portfolio/Blog

```javascript
OpenAuxilium.init({
    serverUrl: 'https://chat.myblog.com',
    title: 'Ask Me Anything',
    welcomeMessage: 'Hi! Ask me about my projects, experience, or anything else you\'d like to know.',
    theme: 'light',
    position: 'bottom-left'
});
```

## 🔄 Server Requirements

The plugin requires an OpenAuxilium server running with the following endpoints:

- `POST /api/chat/sessions` - Create new session
- `POST /api/chat/sessions/:id/messages` - Send message
- `GET /api/chat/sessions/:id/history` - Get history
- `DELETE /api/chat/sessions/:id` - Delete session
- `GET /api/chat/status` - Get server status
- `GET /health` - Health check

## 📱 Mobile Support

The plugin is fully responsive and includes:

- Touch-friendly interface
- Keyboard support for mobile
- Optimized layout for small screens
- Proper viewport handling

## ♿ Accessibility

- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatible

## 🎨 Customization

### Custom CSS

You can override the default styles by adding your own CSS after the plugin loads:

```css
/* Customize chat button */
#auxilium-chat-button {
    background: linear-gradient(45deg, #your-color1, #your-color2) !important;
}

/* Customize chat window */
#auxilium-chat-window {
    border-radius: 10px !important;
}

/* Dark theme customizations */
.auxilium-chat-window.dark {
    background: #your-dark-bg !important;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Chat button not appearing**
   - Check console for JavaScript errors
   - Verify the script path is correct
   - Ensure server URL is accessible

2. **Can't connect to server**
   - Check server is running on specified URL
   - Verify CORS settings allow your domain
   - Check network tab for API call failures

3. **Styling issues**
   - Check for CSS conflicts with your site
   - Verify the styles.css file is loading
   - Try different position settings

### Debug Mode

Enable debug mode to see detailed console logs:

```javascript
OpenAuxilium.init({
    debug: true,
    // ... other options
});
```

### Browser Console

Use browser developer tools to inspect:

```javascript
// Check plugin status
OpenAuxilium.getStatus();

// Check if ready
OpenAuxilium.isReady();

// View configuration
console.log(OpenAuxilium.config);
```

## 📝 Examples

Check the `/examples` folder for:

- `example.html` - Simple integration example

## 🔐 Security Notes

- Always use HTTPS in production
- Validate and sanitize user inputs on the server
- Implement rate limiting to prevent abuse
- Use CORS headers to restrict domain access
- Consider authentication for sensitive applications

## 📞 Support

For issues and questions:

1. Check the troubleshooting section
2. Review example files
3. Open an issue on GitHub
4. Check server logs for API errors
