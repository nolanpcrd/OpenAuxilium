import cors from 'cors';
import express from 'express';

/**
 * Set up common middleware for the API server
 * @param {express.Application} app - Express application
 */
export function setupMiddleware(app) {
    // Enable CORS for all routes
    app.use(cors({
        origin: process.env.ALLOWED_ORIGINS ?
            process.env.ALLOWED_ORIGINS.split(',') : [
                'http://localhost:3000',
                'http://localhost:8080',
                'http://localhost:63342',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:8080',
                'http://127.0.0.1:63342',
            ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Parse JSON bodies
    app.use(express.json({ limit: '10mb' }));

    // Parse URL-encoded bodies
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.path}`);
        next();
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
}

/**
 * Error handling middleware
 * @param {express.Application} app - Express application
 */
export function setupErrorHandling(app) {
    // 404 handler
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            error: `Route ${req.method} ${req.originalUrl} not found`
        });
    });

    // Global error handler
    app.use((error, req, res, next) => {
        console.error('[ERROR]', error);

        res.status(error.status || 500).json({
            success: false,
            error: process.env.NODE_ENV === 'production' ?
                'Internal server error' :
                error.message,
            ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
        });
    });
}
