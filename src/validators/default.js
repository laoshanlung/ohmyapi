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

module.exports = function(input, args, ctx, options) {
  return validate.async(input, args).then(() => {
    return null;
  }).catch((error) => {
    return error;
  });
};
