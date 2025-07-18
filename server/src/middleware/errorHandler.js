class AppError extends Error{
    constructor(message,statusCode,details=null){
        super(message);
        this.statusCode=statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.details = details;
    
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
  
    if (err.name === 'CastError') {
      const message = 'Resource not found';
      error = new AppError(message, 404);
    }
  
    //  duplicate key
    if (err.code === 11000) {
      const message = 'Duplicate field value entered';
      error = new AppError(message, 400);
    }
  
    // validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      error = new AppError(message, 400);
    }

  
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal Server Error',
      details: error.details || null,
    });
  };
  
  export {AppError, errorHandler};