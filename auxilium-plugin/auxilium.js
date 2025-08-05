(function(window, document) {
    'use strict';

    // Prevent multiple initializations
    if (window.OpenAuxilium) {
        console.warn('[OpenAuxilium] Plugin already loaded');
        return;
    }

    // Load required modules
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = () => console.error('[OpenAuxilium] Failed to load:', src);
        document.head.appendChild(script);
    }

    // Get plugin path
    function getPluginPath() {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.src && script.src.includes('auxilium.js')) {
                return script.src.replace('/auxilium.js', '');
            }
        }
        return './auxilium-plugin';
    }

    const pluginPath = getPluginPath();

    // Main OpenAuxilium object
    const OpenAuxilium = {
        // Configuration
        config: {
            serverUrl: 'http://localhost:3000',
            title: 'Assistant',
            theme: 'light',
            position: 'bottom-right',
            welcomeMessage: 'Hello! How can I help you today?',
            placeholder: 'Type your message...',
            autoOpen: false,
            debug: false
        },

        // Internal state
        isInitialized: false,
        isLoading: false,
        chatManager: null,

        /**
         * Initialize the chat plugin
         * @param {Object} options - Configuration options
         */
        init(options = {}) {
            if (this.isInitialized) {
                console.warn('[OpenAuxilium] Already initialized');
                return;
            }

            if (this.isLoading) {
                console.warn('[OpenAuxilium] Already loading');
                return;
            }

            this.isLoading = true;

            // Merge configuration
            this.config = { ...this.config, ...options };

            if (this.config.debug) {
                console.log('[OpenAuxilium] Initializing with config:', this.config);
            }

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this._loadModules());
            } else {
                this._loadModules();
            }
        },

        /**
         * Load required modules
         */
        _loadModules() {
            const modules = [
                `${pluginPath}/src/ChatAPI.js`,
                `${pluginPath}/src/ChatUI.js`,
                `${pluginPath}/src/ChatManager.js`
            ];

            let loadedCount = 0;
            const totalModules = modules.length;

            const onModuleLoad = () => {
                loadedCount++;
                if (loadedCount === totalModules) {
                    this._initialize();
                }
            };

            // Load each module
            modules.forEach(module => {
                loadScript(module, onModuleLoad);
            });
        },

        /**
         * Internal initialization
         */
        _initialize() {
            try {
                // Check if required classes are available
                if (!window.OpenAuxiliumChatAPI ||
                    !window.OpenAuxiliumChatUI ||
                    !window.OpenAuxiliumChatManager) {
                    throw new Error('Required modules not loaded');
                }

                // Load CSS
                this._loadCSS();

                // Initialize chat manager
                this.chatManager = new window.OpenAuxiliumChatManager(this.config);

                // Create and inject UI
                this.chatManager.init();

                this.isInitialized = true;
                this.isLoading = false;

                if (this.config.debug) {
                    console.log('[OpenAuxilium] Initialized successfully');
                }

            } catch (error) {
                console.error('[OpenAuxilium] Initialization failed:', error);
                this.isLoading = false;
            }
        },

        /**
         * Load CSS styles
         */
        _loadCSS() {
            // Check if CSS is already loaded
            if (document.getElementById('openauxilium-styles')) {
                return;
            }

            const link = document.createElement('link');
            link.id = 'openauxilium-styles';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = `${pluginPath}/src/styles.css`;
            document.head.appendChild(link);
        },

        /**
         * Open the chat window
         */
        open() {
            if (this.chatManager) {
                this.chatManager.open();
            } else if (this.config.debug) {
                console.warn('[OpenAuxilium] Chat manager not initialized');
            }
        },

        /**
         * Close the chat window
         */
        close() {
            if (this.chatManager) {
                this.chatManager.close();
            } else if (this.config.debug) {
                console.warn('[OpenAuxilium] Chat manager not initialized');
            }
        },

        /**
         * Toggle the chat window
         */
        toggle() {
            if (this.chatManager) {
                this.chatManager.toggle();
            } else if (this.config.debug) {
                console.warn('[OpenAuxilium] Chat manager not initialized');
            }
        },

        /**
         * Send a message programmatically
         * @param {string} message - Message to send
         */
        sendMessage(message) {
            if (this.chatManager) {
                this.chatManager.sendMessage(message);
            } else if (this.config.debug) {
                console.warn('[OpenAuxilium] Chat manager not initialized');
            }
        },

        /**
         * Clear chat history
         */
        clearHistory() {
            if (this.chatManager) {
                this.chatManager.clearHistory();
            } else if (this.config.debug) {
                console.warn('[OpenAuxilium] Chat manager not initialized');
            }
        },

        /**
         * Check if the plugin is ready
         */
        isReady() {
            return this.isInitialized && this.chatManager !== null;
        },

        /**
         * Get current status
         */
        getStatus() {
            return {
                isInitialized: this.isInitialized,
                isLoading: this.isLoading,
                isReady: this.isReady(),
                config: { ...this.config }
            };
        },

        /**
         * Destroy the plugin
         */
        destroy() {
            if (this.chatManager) {
                this.chatManager.destroy();
                this.chatManager = null;
            }

            // Remove CSS
            const styles = document.getElementById('openauxilium-styles');
            if (styles) {
                styles.remove();
            }

            this.isInitialized = false;
            this.isLoading = false;

            if (this.config.debug) {
                console.log('[OpenAuxilium] Plugin destroyed');
            }
        }
    };

    // Expose to global scope
    window.OpenAuxilium = OpenAuxilium;

    // Auto-init if config is provided via data attributes
    const currentScript = document.currentScript;
    if (currentScript) {
        const autoConfig = {};
        const dataAttrs = currentScript.dataset;

        if (dataAttrs.serverUrl) autoConfig.serverUrl = dataAttrs.serverUrl;
        if (dataAttrs.title) autoConfig.title = dataAttrs.title;
        if (dataAttrs.theme) autoConfig.theme = dataAttrs.theme;
        if (dataAttrs.position) autoConfig.position = dataAttrs.position;
        if (dataAttrs.autoOpen) autoConfig.autoOpen = dataAttrs.autoOpen === 'true';
        if (dataAttrs.debug) autoConfig.debug = dataAttrs.debug === 'true';

        if (Object.keys(autoConfig).length > 0) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                OpenAuxilium.init(autoConfig);
            }, 100);
        }
    }

})(window, document);
