import express from 'express';

/**
 * Create chat routes for the AI conversation API
 * @param {RunAI} aiInstance - Instance of the AI implementation
 * @returns {express.Router} - Express router with chat endpoints
 */
export function createChatRoutes(aiInstance) {
    const router = express.Router();

    /**
     * POST /chat/sessions
     * Create a new conversation session
     */
    router.post('/sessions', async (req, res) => {
        try {
            const { sessionId } = req.body;
            const id = await aiInstance.createSession(sessionId);
            
            res.status(201).json({
                success: true,
                sessionId: id,
                message: 'Session created successfully'
            });
        } catch (error) {
            console.error('[API] Error creating session:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    });

    /**
     * POST /chat/sessions/:sessionId/messages
     * Send a message to a specific session
     */
    router.post('/sessions/:sessionId/messages', async (req, res) => {
        try {
            const { sessionId } = req.params;
            const { message } = req.body;

            if (!message || typeof message !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Message is required and must be a string'
                });
            }

            const response = await aiInstance.sendMessage(sessionId, message);
            
            res.json({
                success: true,
                response,
                sessionId,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('[API] Error sending message:', error);
            
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message
            });
        }
    });

    /**
     * GET /chat/sessions/:sessionId/history
     * Get conversation history for a session
     */
    router.get('/sessions/:sessionId/history', async (req, res) => {
        try {
            const { sessionId } = req.params;
            const history = await aiInstance.getHistory(sessionId);
            
            res.json({
                success: true,
                sessionId,
                history,
                messageCount: history.length
            });
        } catch (error) {
            console.error('[API] Error getting history:', error);
            
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message
            });
        }
    });

    /**
     * DELETE /chat/sessions/:sessionId
     * Delete a conversation session
     */
    router.delete('/sessions/:sessionId', async (req, res) => {
        try {
            const { sessionId } = req.params;
            await aiInstance.deleteSession(sessionId);
            
            res.json({
                success: true,
                message: `Session ${sessionId} deleted successfully`
            });
        } catch (error) {
            console.error('[API] Error deleting session:', error);
            
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message
            });
        }
    });

    /**
     * GET /chat/status
     * Get AI status and queue information
     */
    router.get('/status', async (req, res) => {
        try {
            const queueStatus = aiInstance.getQueueStatus();
            const activeSessions = aiInstance.getActiveSessions ? 
                aiInstance.getActiveSessions() : [];
            
            res.json({
                success: true,
                status: {
                    ...queueStatus,
                    activeSessions
                }
            });
        } catch (error) {
            console.error('[API] Error getting status:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    /**
     * POST /chat/cleanup
     * Clean up inactive sessions
     */
    router.post('/cleanup', async (req, res) => {
        try {
            const { maxAgeMinutes = 60 } = req.body;
            
            if (aiInstance.cleanupInactiveSessions) {
                const cleanedCount = await aiInstance.cleanupInactiveSessions(maxAgeMinutes);
                res.json({
                    success: true,
                    message: `Cleaned up ${cleanedCount} inactive sessions`,
                    cleanedSessions: cleanedCount
                });
            } else {
                res.json({
                    success: true,
                    message: 'Cleanup not supported by this AI implementation',
                    cleanedSessions: 0
                });
            }
        } catch (error) {
            console.error('[API] Error during cleanup:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    /**
     * GET /chat/system-role
     * Get current system role
     */
    router.get('/system-role', async (req, res) => {
        try {
            if (aiInstance.getSystemRole) {
                const systemRole = aiInstance.getSystemRole();
                res.json({
                    success: true,
                    systemRole
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: 'System role management not supported by this AI implementation'
                });
            }
        } catch (error) {
            console.error('[API] Error getting system role:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    /**
     * PUT /chat/system-role
     * Update system role
     */
    router.put('/system-role', async (req, res) => {
        try {
            const { systemRole } = req.body;

            if (!systemRole || typeof systemRole !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'systemRole is required and must be a string'
                });
            }

            if (aiInstance.updateSystemRole) {
                aiInstance.updateSystemRole(systemRole);
                res.json({
                    success: true,
                    message: 'System role updated successfully',
                    systemRole
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: 'System role management not supported by this AI implementation'
                });
            }
        } catch (error) {
            console.error('[API] Error updating system role:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    return router;
}