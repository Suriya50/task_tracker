const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { message, statusCode: 404 };
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `Duplicate field value entered for ${field}`;
    error = { message, statusCode: 400 };
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token, please log in again';
    error = { message, statusCode: 401 };
  }
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired, please log in again';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
  });
};

module.exports = errorHandler;