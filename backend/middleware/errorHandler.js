const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error('🔴 Error Handler Triggered:', err);
    console.error('Error Name:', err.name);
    console.error('Error Code:', err.code);
    console.error('Error Stack:', err.stack);

    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // Ensure we always send JSON
    const statusCode = error.statusCode || 500;
    const errorResponse = {
        success: false,
        message: error.message || 'Server Error',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };

    console.log('📤 Sending error response:', JSON.stringify(errorResponse));
    
    // Make sure content-type is JSON
    res.setHeader('Content-Type', 'application/json');
    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
