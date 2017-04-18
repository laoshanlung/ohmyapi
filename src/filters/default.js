const autoParse = require('auto-parse'),
      _ = require('lodash');

module.exports = function(input, args, options) {
  input = autoParse(input);

  const valid = _.keys(args);

  input = _.pick(input, valid);

  _.forEach(args, (attrConstraints, attr) => {
    // Default value
    if (attrConstraints.default !== undefined
      && input[attr] === undefined) {
      input[attr] = attrConstraints.default
    }
  });

  return input;
};
