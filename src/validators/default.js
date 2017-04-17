const validate = require('validate.js');

// This is just a dummy validator so that we can pass `default`
// in `arg`
validate.validators['default'] = () => {
  return null;
};


function ValidationError(errors, options, values, args) {
  Error.captureStackTrace(this, this.constructor);
  this.data = errors;
  this.message = 'Failed to validate request';
}
ValidationError.prototype = new Error();

module.exports = function(values, args, options) {
  return validate.async(values, args, {wrapErrors: ValidationError});
};
