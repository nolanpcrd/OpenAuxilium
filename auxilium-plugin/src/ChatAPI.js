/**
 * ChatAPI - Handles communication with the OpenAuxilium server
 */
class ChatAPI {
    constructor(serverUrl) {
        this.serverUrl = serverUrl.replace(/\/$/, ''); // Remove trailing slash
        this.baseUrl = `${this.serverUrl}/api/chat`;
    }

    /**
     * Make HTTP request with error handling
     */
    async _request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to server');
            }
            throw error;
        }
    }

    /**
     * Create a new chat session
     * @returns {Promise<string>} Session ID
     */
    async createSession() {
        const response = await this._request('/sessions', {
            method: 'POST'
        });

        if (!response.success) {
            throw new Error(response.error || 'Failed to create session');
        }

        return response.sessionId;
    }

    /**
     * Send a message to a session
     * @param {string} sessionId - Session ID
     * @param {string} message - Message content
     * @returns {Promise<Object>} Response data
     */
    async sendMessage(sessionId, message) {
        const response = await this._request(`/sessions/${sessionId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ message })
        });

        if (!response.success) {
            throw new Error(response.error || 'Failed to send message');
        }

        return response;
    }

    /**
     * Delete a session
     * @param {string} sessionId - Session ID
     * @returns {Promise<void>}
     */
    async deleteSession(sessionId) {
        const response = await this._request(`/sessions/${sessionId}`, {
            method: 'DELETE'
        });

        if (!response.success) {
            throw new Error(response.error || 'Failed to delete session');
        }
    }

    /**
     * Get server status
     * @returns {Promise<Object>} Status information
     */
    async getStatus() {
        const response = await this._request('/status');

        if (!response.success) {
            throw new Error(response.error || 'Failed to get status');
        }

        return response.status;
    }

    /**
     * Clean up inactive sessions
     * @param {number} maxAgeMinutes - Maximum age in minutes
     * @returns {Promise<number>} Number of cleaned sessions
     */
    async cleanup(maxAgeMinutes = 60) {
        const response = await this._request('/cleanup', {
            method: 'POST',
            body: JSON.stringify({ maxAgeMinutes })
        });

        if (!response.success) {
            throw new Error(response.error || 'Failed to cleanup sessions');
        }

        return response.cleanedSessions;
    }
}

// Export for global use
window.OpenAuxiliumChatAPI = ChatAPI;
