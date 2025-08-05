import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { RunAILlamaCpp } from './AI/RunAILlamaCpp.js';
import { createChatRoutes } from './API/chatRoutes.js';
import { setupMiddleware, setupErrorHandling } from './API/middleware.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

class OpenAuxiliumServer {
    constructor() {
        this.app = express();
        this.aiInstance = null;
        this.server = null;
        this.port = process.env.PORT || 3000;
        this.isShuttingDown = false;
    }

    /**
     * Initialize the AI model
     */
    async initializeAI() {
        try {
            console.log('[Server] Initializing AI...');

            this.aiInstance = new RunAILlamaCpp();

            // Get model path from environment
            const modelName = process.env.MODEL_NAME || 'model.gguf';
            const modelPath = path.join(__dirname, 'AI', modelName);

            console.log('[Server] Model path:', modelPath);
            await this.aiInstance.initialize(modelPath);

            console.log('[Server] AI initialized successfully');
        } catch (error) {
            console.error('[Server] Failed to initialize AI:', error);
            throw error;
        }
    }

    /**
     * Setup Express application
     */
    setupExpress() {
        console.log('[Server] Setting up Express application...');

        // Setup middleware
        setupMiddleware(this.app);

        // Setup chat routes
        if (this.aiInstance) {
            const chatRoutes = createChatRoutes(this.aiInstance);
            this.app.use('/api/chat', chatRoutes);
        }

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                name: 'OpenAuxilium Server',
                version: '1.0.0',
                status: 'running',
                aiStatus: this.aiInstance ? 'initialized' : 'not initialized',
                endpoints: {
                    health: '/health',
                    chat: '/api/chat',
                    sessions: '/api/chat/sessions',
                    status: '/api/chat/status'
                }
            });
        });

        // Setup error handling
        setupErrorHandling(this.app);

        console.log('[Server] Express application configured');
    }

    /**
     * Start the server
     */
    async start() {
        try {
            console.log('[Server] Starting OpenAuxilium Server...');

            // Initialize AI first
            await this.initializeAI();

            // Setup Express
            this.setupExpress();

            // Start HTTP server
            this.server = this.app.listen(this.port, () => {
                console.log(`[Server] Server running on port ${this.port}`);
                console.log(`[Server] Health check: http://localhost:${this.port}/health`);
                console.log(`[Server] API status: http://localhost:${this.port}/api/chat/status`);
            });

            // Setup cleanup interval for inactive sessions
            this.setupCleanupInterval();

            // Setup graceful shutdown
            this.setupGracefulShutdown();

        } catch (error) {
            console.error('[Server] Failed to start server:', error);
            process.exit(1);
        }
    }

    /**
     * Setup periodic cleanup of inactive sessions
     */
    setupCleanupInterval() {
        const cleanupInterval = process.env.CLEANUP_INTERVAL_MINUTES || 30;
        const maxSessionAge = process.env.MAX_SESSION_AGE_MINUTES || 60;

        setInterval(async () => {
            if (this.aiInstance && this.aiInstance.cleanupInactiveSessions && !this.isShuttingDown) {
                try {
                    const cleaned = await this.aiInstance.cleanupInactiveSessions(maxSessionAge);
                    if (cleaned > 0) {
                        console.log(`[Server] Cleaned up ${cleaned} inactive sessions`);
                    }
                } catch (error) {
                    console.error('[Server] Error during session cleanup:', error);
                }
            }
        }, cleanupInterval * 60 * 1000);

        console.log(`[Server] Cleanup interval set to ${cleanupInterval} minutes`);
    }

    /**
     * Setup graceful shutdown handlers
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            if (this.isShuttingDown) return;

            console.log(`[Server] Received ${signal}, shutting down gracefully...`);
            this.isShuttingDown = true;

            // Close HTTP server
            if (this.server) {
                this.server.close(() => {
                    console.log('[Server] HTTP server closed');
                });
            }

            // Cleanup AI resources
            if (this.aiInstance) {
                try {
                    await this.aiInstance.cleanup();
                    console.log('[Server] AI resources cleaned up');
                } catch (error) {
                    console.error('[Server] Error cleaning up AI resources:', error);
                }
            }

            console.log('[Server] Shutdown complete');
            process.exit(0);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('[Server] Uncaught exception:', error);
            shutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('[Server] Unhandled rejection at:', promise, 'reason:', reason);
            shutdown('unhandledRejection');
        });
    }
}

// Start the server
const server = new OpenAuxiliumServer();
server.start().catch((error) => {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
});
