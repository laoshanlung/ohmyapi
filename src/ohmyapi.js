const Builder = require('./Builder');

module.exports = function(routes) {
  return new Builder(routes);
};
