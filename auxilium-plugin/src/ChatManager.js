/**
 * ChatManager - Main controller for the chat widget
 */
class ChatManager {
    constructor(config) {
        this.config = config;
        this.chatUI = null;
        this.chatAPI = null;
        this.sessionId = null;
        this.isOpen = false;
        this.isConnected = false;
    }

    /**
     * Initialize the chat manager
     */
    async init() {
        try {
            // Initialize API
            this.chatAPI = new OpenAuxiliumChatAPI(this.config.serverUrl);
            
            // Test connection
            await this._testConnection();
            
            // Initialize UI
            this.chatUI = new OpenAuxiliumChatUI(this.config);
            this.chatUI.create();
            
            // Setup event listeners
            this._setupEventListeners();
            
            // Auto-open if configured
            if (this.config.autoOpen) {
                this.open();
            }
            
        } catch (error) {
            console.error('[ChatManager] Initialization failed:', error);
            this._showConnectionError();
        }
    }

    /**
     * Test connection to server
     */
    async _testConnection() {
        try {
            await this.chatAPI.getStatus();
            this.isConnected = true;
            if (this.config.debug) {
                console.log('[ChatManager] Connected to server');
            }
        } catch (error) {
            this.isConnected = false;
            throw new Error('Cannot connect to chat server');
        }
    }

    /**
     * Create a new chat session
     */
    async _createSession() {
        try {
            this.sessionId = await this.chatAPI.createSession();
            if (this.config.debug) {
                console.log('[ChatManager] Session created:', this.sessionId);
            }
        } catch (error) {
            console.error('[ChatManager] Failed to create session:', error);
            throw error;
        }
    }

    /**
     * Setup event listeners
     */
    _setupEventListeners() {
        // Chat button click
        this.chatUI.onToggle(() => {
            this.toggle();
        });

        // Message send
        this.chatUI.onMessageSend((message) => {
            this.sendMessage(message);
        });

        // Close button
        this.chatUI.onClose(() => {
            this.close();
        });

        // Clear history
        this.chatUI.onClearHistory(() => {
            this.clearHistory();
        });
    }

    /**
     * Open chat window
     */
    open() {
        if (!this.isConnected) {
            this._showConnectionError();
            return;
        }

        this.chatUI.open();
        this.isOpen = true;

        // Show welcome message if no history
        if (this.chatUI.getMessageCount() === 0) {
            this.chatUI.addMessage({
                role: 'assistant',
                content: this.config.welcomeMessage,
                timestamp: new Date()
            });
        }
    }

    /**
     * Close chat window
     */
    close() {
        this.chatUI.close();
        this.isOpen = false;
    }

    /**
     * Toggle chat window
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Send a message
     */
    async sendMessage(message) {
        if (!this.isConnected) {
            this._showConnectionError();
            return;
        }
        
        // Create session on first message if needed
        if (!this.sessionId) {
            try {
                await this._createSession();
            } catch (error) {
                this._showConnectionError();
                return;
            }
        }

        if (!message || message.trim() === '') {
            return;
        }

        try {
            // Add user message to UI
            this.chatUI.addMessage({
                role: 'user',
                content: message,
                timestamp: new Date()
            });

            // Show typing indicator
            this.chatUI.showTyping();

            // Send to API
            const response = await this.chatAPI.sendMessage(this.sessionId, message);

            // Hide typing indicator
            this.chatUI.hideTyping();

            // Add assistant response to UI
            this.chatUI.addMessage({
                role: 'assistant',
                content: response.response,
                timestamp: new Date(response.timestamp)
            });

        } catch (error) {
            console.error('[ChatManager] Failed to send message:', error);
            
            // Hide typing indicator
            this.chatUI.hideTyping();
            
            // Show error message
            this.chatUI.addMessage({
                role: 'system',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            });
        }
    }

    /**
     * Clear chat history
     */
    async clearHistory() {
        try {
            // Delete current session
            if (this.sessionId) {
                await this.chatAPI.deleteSession(this.sessionId);
            }

            // Create new session
            await this._createSession();

            // Clear UI
            this.chatUI.clearMessages();

            // Show welcome message
            this.chatUI.addMessage({
                role: 'assistant',
                content: this.config.welcomeMessage,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('[ChatManager] Failed to clear history:', error);
        }
    }

    /**
     * Show connection error
     */
    _showConnectionError() {
        if (this.chatUI) {
            this.chatUI.showError('Unable to connect to chat server. Please try again later.');
        } else {
            console.error('[ChatManager] Cannot connect to chat server');
        }
    }

    /**
     * Destroy the chat manager
     */
    destroy() {
        // Delete session
        if (this.sessionId) {
            this.chatAPI.deleteSession(this.sessionId).catch(console.error);
        }

        // Destroy UI
        if (this.chatUI) {
            this.chatUI.destroy();
        }

        // Reset state
        this.sessionId = null;
        this.isOpen = false;
        this.isConnected = false;
    }
}

// Export for global use
window.OpenAuxiliumChatManager = ChatManager;