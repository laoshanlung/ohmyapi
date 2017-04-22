const validate = require('validate.js'),
      autoParse = require('auto-parse'),
      _ = require('lodash');

// This is just a dummy validator so that we can pass `default`
// in `arg`
validate.validators['default'] = () => {
  return null;
};

validate.validators['boolean'] = function(value, options, key, attributes, globalOptions) {
  if (value === undefined) return null;
  value = autoParse(value);

  if (_.isBoolean(value)) return null;

  return options.message || '^Invalid boolean value';
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
