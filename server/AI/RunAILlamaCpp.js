import { getLlama, LlamaChatSession } from 'node-llama-cpp';
import { RunAI } from './RunAI.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Implementation of RunAI with queue management for concurrent conversations using LLaMA C++ bindings
 */
export class RunAILlamaCpp extends RunAI {
    constructor() {
        super();
        this.llama = null;
        this.model = null;
        this.sessions = new Map(); // sessionId -> { session, history, context }
        this.isInitialized = false;
        this.processingQueue = [];
        this.currentlyProcessing = false;
        this.maxConcurrentSessions = 10;
        this.systemRole = process.env.AI_SYSTEM_ROLE || 'You are a helpful assistant.';
    }

    /**
     * Initialize the LLaMA model
     * @param {string} modelPath - Path to the GGUF model file
     */
    async initialize(modelPath) {
        try {
            console.log('[RunAILlamaCpp] Initializing LLaMA...');
            this.llama = await getLlama();

            console.log('[RunAILlamaCpp] Loading model:', modelPath);
            this.model = await this.llama.loadModel({
                modelPath: modelPath
            });

            this.isInitialized = true;
            console.log('[RunAILlamaCpp] Model initialized successfully');
        } catch (error) {
            console.error('[RunAILlamaCpp] Failed to initialize model:', error);
            throw new Error(`Failed to initialize LLaMA model: ${error.message}`);
        }
    }

    /**
     * Create a new conversation session
     * @param {string} sessionId - Optional session ID, generates one if not provided
     * @returns {Promise<string>} - Returns the session ID
     */
    async createSession(sessionId = null) {
        if (!this.isInitialized) {
            throw new Error('Model not initialized. Call initialize() first.');
        }

        if (this.sessions.size >= this.maxConcurrentSessions) {
            throw new Error(`Maximum concurrent sessions (${this.maxConcurrentSessions}) reached`);
        }

        const id = sessionId || uuidv4();

        if (this.sessions.has(id)) {
            throw new Error(`Session ${id} already exists`);
        }

        try {
            const context = await this.model.createContext();
            const session = new LlamaChatSession({
                contextSequence: context.getSequence(),
                systemPrompt: this.systemRole
            });

            this.sessions.set(id, {
                session,
                context,
                history: [],
                createdAt: new Date(),
                lastActivity: new Date(),
                systemRoleSet: true
            });

            console.log(`[RunAILlamaCpp] Created session: ${id} with system role`);
            return id;
        } catch (error) {
            console.error('[RunAILlamaCpp] Failed to create session:', error);
            throw new Error(`Failed to create session: ${error.message}`);
        }
    }

    /**
     * Send a message and get a response (with queue management)
     * @param {string} sessionId - Session identifier
     * @param {string} message - User message
     * @returns {Promise<string>} - AI response
     */
    async sendMessage(sessionId, message) {
        if (!this.sessions.has(sessionId)) {
            throw new Error(`Session ${sessionId} not found`);
        }

        return new Promise((resolve, reject) => {
            this.processingQueue.push({
                sessionId,
                message,
                resolve,
                reject,
                timestamp: Date.now()
            });

            this._processQueue();
        });
    }

    /**
     * Process the message queue (ensures single-threaded AI processing)
     */
    async _processQueue() {
        if (this.currentlyProcessing || this.processingQueue.length === 0) {
            return;
        }

        this.currentlyProcessing = true;

        while (this.processingQueue.length > 0) {
            const request = this.processingQueue.shift();

            try {
                const response = await this._processMessage(request.sessionId, request.message);
                request.resolve(response);
            } catch (error) {
                request.reject(error);
            }
        }

        this.currentlyProcessing = false;
    }

    /**
     * Actually process a single message
     * @param {string} sessionId - Session identifier
     * @param {string} message - User message
     * @returns {Promise<string>} - AI response
     */
    async _processMessage(sessionId, message) {
        const sessionData = this.sessions.get(sessionId);

        if (!sessionData) {
            throw new Error(`Session ${sessionId} not found`);
        }

        try {
            console.log(`[RunAILlamaCpp] Processing message for session ${sessionId}`);

            // Add user message to history
            sessionData.history.push({
                role: 'user',
                content: message,
                timestamp: new Date()
            });

            // Prepare message with system role reinforcement for better compliance
            const reinforcedMessage = `System: ${this.systemRole}\n\nUser: ${message}`;

            // Get AI response
            const rawResponse = await sessionData.session.prompt(reinforcedMessage);
            
            // Clean up response by trimming trailing whitespace and empty lines
            const response = rawResponse.trim();

            // Add AI response to history (store original user message)
            sessionData.history.push({
                role: 'assistant',
                content: response,
                timestamp: new Date()
            });

            // Update last activity
            sessionData.lastActivity = new Date();

            console.log(`[RunAILlamaCpp] Generated response for session ${sessionId}`);
            return response;

        } catch (error) {
            console.error(`[RunAILlamaCpp] Error processing message for session ${sessionId}:`, error);
            throw new Error(`Failed to process message: ${error.message}`);
        }
    }

    /**
     * Get conversation history for a session
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Array>} - Array of message objects
     */
    async getHistory(sessionId) {
        const sessionData = this.sessions.get(sessionId);

        if (!sessionData) {
            throw new Error(`Session ${sessionId} not found`);
        }

        return sessionData.history;
    }

    /**
     * Delete a conversation session
     * @param {string} sessionId - Session identifier
     * @returns {Promise<void>}
     */
    async deleteSession(sessionId) {
        const sessionData = this.sessions.get(sessionId);

        if (!sessionData) {
            throw new Error(`Session ${sessionId} not found`);
        }

        try {
            // Clean up context resources
            if (sessionData.context) {
                await sessionData.context.dispose();
            }

            this.sessions.delete(sessionId);
            console.log(`[RunAILlamaCpp] Deleted session: ${sessionId}`);
        } catch (error) {
            console.error(`[RunAILlamaCpp] Error deleting session ${sessionId}:`, error);
            throw new Error(`Failed to delete session: ${error.message}`);
        }
    }

    /**
     * Get queue status
     * @returns {Object} - Queue information
     */
    getQueueStatus() {
        return {
            queueLength: this.processingQueue.length,
            isProcessing: this.currentlyProcessing,
            activeSessions: this.sessions.size,
            maxSessions: this.maxConcurrentSessions
        };
    }

    /**
     * Get all active sessions info
     * @returns {Array} - Array of session info
     */
    getActiveSessions() {
        const sessions = [];
        for (const [id, data] of this.sessions) {
            sessions.push({
                id,
                createdAt: data.createdAt,
                lastActivity: data.lastActivity,
                messageCount: data.history.length
            });
        }
        return sessions;
    }

    /**
     * Update the system role for the AI
     * @param {string} newRole - New system role/prompt
     */
    updateSystemRole(newRole) {
        if (!newRole || typeof newRole !== 'string') {
            throw new Error('System role must be a non-empty string');
        }

        this.systemRole = newRole;
        console.log('[RunAILlamaCpp] System role updated');
    }

    /**
     * Get current system role
     * @returns {string} - Current system role
     */
    getSystemRole() {
        return this.systemRole;
    }

    /**
     * Clean up old inactive sessions
     * @param {number} maxAgeMinutes - Maximum age in minutes before cleanup
     */
    async cleanupInactiveSessions(maxAgeMinutes = 60) {
        const now = new Date();
        const sessionsToDelete = [];

        for (const [id, data] of this.sessions) {
            const ageMinutes = (now - data.lastActivity) / (1000 * 60);
            if (ageMinutes > maxAgeMinutes) {
                sessionsToDelete.push(id);
            }
        }

        for (const sessionId of sessionsToDelete) {
            try {
                await this.deleteSession(sessionId);
                console.log(`[RunAILlamaCpp] Cleaned up inactive session: ${sessionId}`);
            } catch (error) {
                console.error(`[RunAILlamaCpp] Error cleaning up session ${sessionId}:`, error);
            }
        }

        return sessionsToDelete.length;
    }

    /**
     * Clean up all resources
     * @returns {Promise<void>}
     */
    async cleanup() {
        console.log('[RunAILlamaCpp] Starting cleanup...');

        // Clear processing queue
        this.processingQueue = [];

        // Clean up all sessions
        const sessionIds = Array.from(this.sessions.keys());
        for (const sessionId of sessionIds) {
            try {
                await this.deleteSession(sessionId);
            } catch (error) {
                console.error(`[RunAILlamaCpp] Error cleaning up session ${sessionId}:`, error);
            }
        }

        // Clean up model resources
        if (this.model) {
            try {
                await this.model.dispose();
            } catch (error) {
                console.error('[RunAILlamaCpp] Error disposing model:', error);
            }
        }

        this.isInitialized = false;
        console.log('[RunAILlamaCpp] Cleanup completed');
    }
}
