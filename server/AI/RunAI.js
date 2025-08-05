/**
 * Abstract interface for AI conversation management
 */
export class RunAI {
    /**
     * Initialize the AI model
     * @param {string} modelPath - Path to the model file
     * @returns {Promise<void>}
     */
    async initialize(modelPath) {
        throw new Error('initialize method must be implemented');
    }

    /**
     * Create a new conversation session
     * @param {string} sessionId - Unique session identifier
     * @returns {Promise<string>} - Returns the session ID
     */
    async createSession(sessionId) {
        throw new Error('createSession method must be implemented');
    }

    /**
     * Send a message and get a response
     * @param {string} sessionId - Session identifier
     * @param {string} message - User message
     * @returns {Promise<string>} - AI response
     */
    async sendMessage(sessionId, message) {
        throw new Error('sendMessage method must be implemented');
    }

    /**
     * Get conversation history for a session
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Array>} - Array of message objects
     */
    async getHistory(sessionId) {
        throw new Error('getHistory method must be implemented');
    }

    /**
     * Delete a conversation session
     * @param {string} sessionId - Session identifier
     * @returns {Promise<void>}
     */
    async deleteSession(sessionId) {
        throw new Error('deleteSession method must be implemented');
    }

    /**
     * Get queue status
     * @returns {Object} - Queue information
     */
    getQueueStatus() {
        throw new Error('getQueueStatus method must be implemented');
    }

    /**
     * Clean up resources
     * @returns {Promise<void>}
     */
    async cleanup() {
        throw new Error('cleanup method must be implemented');
    }
}
