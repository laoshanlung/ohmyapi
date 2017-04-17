const _ = require('lodash');

module.exports = function(input, args, options) {
  input = _.chain(input).mapValues((value, attr) => {
    const attrConstraints = args[attr];
    if (!attrConstraints) return undefined;

    // boolean
    if (attrConstraints.boolean) return JSON.parse(value);

    // number
    if (attrConstraints.numericality) {
      const numericality = attrConstraints.numericality;
      if (numericality.onlyInteger) return parseInt(value, 10);
      return parseFloat(value);
    }

    return value;
  }).omitBy(_.isUndefined).value();

  _.forEach(args, (attrConstraints, attr) => {
    // Default value
    if (attrConstraints.default !== undefined
      && input[attr] === undefined) {
      input[attr] = attrConstraints.default
    }
  });

  return input;
};
