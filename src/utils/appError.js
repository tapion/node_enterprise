class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.status = statusCode;
    this.statusCode = statusCode;
    this.description = message;
    this.operational = true;
    this.message = `${statusCode}`.startsWith('4')
      ? ' lbl_err_not_found'
      : 'lbl_err_err';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
