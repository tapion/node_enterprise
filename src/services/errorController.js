module.exports = (err, req, res, next) => {
  res.status(err.status).json({
    status: err.status,
    message: err.message,
    description: err.description,
  });
};
