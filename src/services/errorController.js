const AppError = require('../utils/appError');

const sendDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.statusCode,
    message: err.message,
    serverTime: Date.now(),
    description: err.description,
    stack: err.stack,
    data: [],
  });
};

const sendProd = (err, res) => {
  if (err.operational) {
    res.status(err.statusCode).json({
      status: err.status,
      serverTime: Date.now(),
      message: err.message,
      data: [],
    });
  } else {
    console.log('Error!!!!!', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const handlerJWTerror = () => new AppError('Invalid token', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'JsonWebTokenError') error = handlerJWTerror();
    sendProd(error, res);
  }
};
