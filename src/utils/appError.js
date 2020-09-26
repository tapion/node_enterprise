class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.status = statusCode;
    this.description = message;
    this.message = `${statusCode}`.startsWith('4')
      ? ' lbl_err_not_found'
      : 'lbl_err_err';
  }
}

module.exports = AppError;
