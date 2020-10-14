const sendDev = (err, res) => {
  res.status(err.status).json({
    status: err.status,
    message: err.message,
    description: err.description,
    stack: err.stack,
  });
};

const sendProd = (err, res) => {
  if (err.operational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('Error!!!!!', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    const error = { ...err };
    sendProd(error, res);
  }
};
