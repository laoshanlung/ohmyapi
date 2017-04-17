function ValidationError(errors, options, values, args) {
  Error.captureStackTrace(this, this.constructor);
  this.data = errors;
  this.message = 'Failed to validate request';
  this.options = options;
  this.values = values;
  this.args = args;
}
ValidationError.prototype = new Error();

module.exports = ValidationError;
