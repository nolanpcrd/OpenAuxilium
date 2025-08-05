/**
 * ChatUI - Handles the user interface for the chat widget
 */
class ChatUI {
    constructor(config) {
        this.config = config;
        this.isOpen = false;
        this.elements = {};
        this.messageCount = 0;
        
        // Get dynamic plugin path for images
        this.pluginPath = this._getPluginPath();
        
        // Event callbacks
        this.callbacks = {
            onToggle: null,
            onMessageSend: null,
            onClose: null,
            onClearHistory: null
        };
    }
    
    /**
     * Get the plugin path dynamically
     */
    _getPluginPath() {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.src && script.src.includes('auxilium.js')) {
                return script.src.replace('/auxilium.js', '');
            }
        }
        return './auxilium-plugin';
    }

    /**
     * Create the chat UI elements
     */
    create() {
        this._createChatButton();
        this._createChatWindow();
        this._attachEventListeners();
    }

    /**
     * Create the floating chat button
     */
    _createChatButton() {
        const button = document.createElement('div');
        button.id = 'auxilium-chat-button';
        button.className = `auxilium-chat-button ${this.config.position}`;
        button.setAttribute('role', 'button');
        button.setAttribute('aria-label', 'Open chat');
        button.title = `Open ${this.config.title}`;

        button.innerHTML = `
            <div class="auxilium-button-icon">
                <img src="${this.pluginPath}/images/chat-icon.png" width="24" height="24" alt="Chat" class="auxilium-icon" />
            </div>
            <div class="auxilium-button-close" style="display: none;">
                <img src="${this.pluginPath}/images/close-icon.png" width="24" height="24" alt="Close" class="auxilium-icon" />
            </div>
        `;

        document.body.appendChild(button);
        this.elements.button = button;
    }

    /**
     * Create the chat window
     */
    _createChatWindow() {
        const chatWindow = document.createElement('div');
        chatWindow.id = 'auxilium-chat-window';
        chatWindow.className = `auxilium-chat-window ${this.config.position} ${this.config.theme}`;
        chatWindow.style.display = 'none';

        chatWindow.innerHTML = `
            <div class="auxilium-chat-header">
                <div class="auxilium-chat-title">
                    <div class="auxilium-status-indicator"></div>
                    <span>${this.config.title}</span>
                </div>
                <div class="auxilium-chat-actions">
                    <button class="auxilium-action-btn" id="auxilium-clear-btn" title="Clear conversation">
                        <img src="${this.pluginPath}/images/trash-icon.png" width="16" height="16" alt="Clear" class="auxilium-icon" />
                    </button>
                    <button class="auxilium-action-btn" id="auxilium-close-btn" title="Close chat">
                        <img src="${this.pluginPath}/images/close-icon.png" width="16" height="16" alt="Close" class="auxilium-icon" />
                    </button>
                </div>
            </div>
            
            <div class="auxilium-chat-messages" id="auxilium-messages">
                <!-- Messages will be added here -->
            </div>
            
            <div class="auxilium-typing-indicator" id="auxilium-typing" style="display: none;">
                <div class="auxilium-typing-dot"></div>
                <div class="auxilium-typing-dot"></div>
                <div class="auxilium-typing-dot"></div>
                <span>Assistant is typing...</span>
            </div>
            
            <div class="auxilium-chat-input">
                <div class="auxilium-input-container">
                    <textarea 
                        id="auxilium-message-input" 
                        placeholder="${this.config.placeholder}"
                        rows="1"
                        maxlength="2000"
                    ></textarea>
                    <button id="auxilium-send-btn" class="auxilium-send-btn" disabled>
                        <img src="${this.pluginPath}/images/send-icon.png" width="20" height="20" alt="Send" class="auxilium-icon" />
                    </button>
                </div>
                <div class="auxilium-input-footer">
                    <small>Powered by OpenAuxilium</small>
                </div>
            </div>
            
            <div class="auxilium-error-message" id="auxilium-error" style="display: none;">
                <div class="auxilium-error-content">
                    <span class="auxilium-error-text"></span>
                    <button class="auxilium-error-close">&times;</button>
                </div>
            </div>
        `;

        document.body.appendChild(chatWindow);
        this.elements.window = chatWindow;
        this.elements.messages = chatWindow.querySelector('#auxilium-messages');
        this.elements.input = chatWindow.querySelector('#auxilium-message-input');
        this.elements.sendBtn = chatWindow.querySelector('#auxilium-send-btn');
        this.elements.typing = chatWindow.querySelector('#auxilium-typing');
        this.elements.error = chatWindow.querySelector('#auxilium-error');
        this.elements.clearBtn = chatWindow.querySelector('#auxilium-clear-btn');
        this.elements.closeBtn = chatWindow.querySelector('#auxilium-close-btn');
    }

    /**
     * Attach event listeners
     */
    _attachEventListeners() {
        // Chat button toggle
        this.elements.button.addEventListener('click', () => {
            if (this.callbacks.onToggle) {
                this.callbacks.onToggle();
            }
        });

        // Close button
        this.elements.closeBtn.addEventListener('click', () => {
            if (this.callbacks.onClose) {
                this.callbacks.onClose();
            }
        });

        // Clear button
        this.elements.clearBtn.addEventListener('click', () => {
            if (this.callbacks.onClearHistory) {
                this.callbacks.onClearHistory();
            }
        });

        // Send button
        this.elements.sendBtn.addEventListener('click', () => {
            this._handleSendMessage();
        });

        // Input events
        this.elements.input.addEventListener('input', () => {
            this._handleInputChange();
            this._autoResize();
        });

        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this._handleSendMessage();
            }
        });

        // Error close
        const errorClose = this.elements.error.querySelector('.auxilium-error-close');
        errorClose.addEventListener('click', () => {
            this.hideError();
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.elements.window.contains(e.target) && 
                !this.elements.button.contains(e.target)) {
                if (this.callbacks.onClose) {
                    this.callbacks.onClose();
                }
            }
        });
    }

    /**
     * Handle input change
     */
    _handleInputChange() {
        const hasText = this.elements.input.value.trim().length > 0;
        this.elements.sendBtn.disabled = !hasText;
    }

    /**
     * Auto-resize textarea
     */
    _autoResize() {
        const input = this.elements.input;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }

    /**
     * Handle send message
     */
    _handleSendMessage() {
        const message = this.elements.input.value.trim();
        if (message && this.callbacks.onMessageSend) {
            this.callbacks.onMessageSend(message);
            this.elements.input.value = '';
            this._handleInputChange();
            this._autoResize();
        }
    }

    /**
     * Open chat window
     */
    open() {
        this.elements.window.style.display = 'flex';
        this.elements.button.querySelector('.auxilium-button-icon').style.display = 'none';
        this.elements.button.querySelector('.auxilium-button-close').style.display = 'block';
        this.isOpen = true;
        
        // Focus input
        setTimeout(() => {
            this.elements.input.focus();
        }, 100);
        
        // Scroll to bottom
        this._scrollToBottom();
    }

    /**
     * Close chat window
     */
    close() {
        this.elements.window.style.display = 'none';
        this.elements.button.querySelector('.auxilium-button-icon').style.display = 'block';
        this.elements.button.querySelector('.auxilium-button-close').style.display = 'none';
        this.isOpen = false;
        this.hideError();
    }

    /**
     * Add a message to the chat
     */
    addMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = `auxilium-message auxilium-message-${message.role}`;
        
        const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageEl.innerHTML = `
            <div class="auxilium-message-content">
                <div class="auxilium-message-text">${this._formatMessage(message.content)}</div>
                <div class="auxilium-message-time">${timestamp}</div>
            </div>
        `;

        this.elements.messages.appendChild(messageEl);
        this.messageCount++;
        this._scrollToBottom();
    }

    /**
     * Format message content with basic Markdown support
     */
    _formatMessage(content) {
        // First escape HTML
        let formatted = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Basic Markdown formatting
        // Bold **text** or __text__
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // Italic *text* or _text_
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
        
        // Code `text`
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Links [text](url)
        formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }

    /**
     * Show typing indicator
     */
    showTyping() {
        this.elements.typing.style.display = 'flex';
        this._scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTyping() {
        this.elements.typing.style.display = 'none';
    }

    /**
     * Show error message
     */
    showError(message) {
        this.elements.error.querySelector('.auxilium-error-text').textContent = message;
        this.elements.error.style.display = 'block';
    }

    /**
     * Hide error message
     */
    hideError() {
        this.elements.error.style.display = 'none';
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        this.elements.messages.innerHTML = '';
        this.messageCount = 0;
    }

    /**
     * Scroll to bottom of messages
     */
    _scrollToBottom() {
        setTimeout(() => {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }, 10);
    }

    /**
     * Get message count
     */
    getMessageCount() {
        return this.messageCount;
    }

    /**
     * Set event callbacks
     */
    onToggle(callback) { this.callbacks.onToggle = callback; }
    onMessageSend(callback) { this.callbacks.onMessageSend = callback; }
    onClose(callback) { this.callbacks.onClose = callback; }
    onClearHistory(callback) { this.callbacks.onClearHistory = callback; }

    /**
     * Destroy the UI
     */
    destroy() {
        if (this.elements.button) {
            this.elements.button.remove();
        }
        if (this.elements.window) {
            this.elements.window.remove();
        }
        this.elements = {};
        this.isOpen = false;
    }
}

// Export for global use
window.OpenAuxiliumChatUI = ChatUI;