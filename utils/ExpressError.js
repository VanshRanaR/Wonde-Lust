class ExpressError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode; // always a number
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ExpressError;
