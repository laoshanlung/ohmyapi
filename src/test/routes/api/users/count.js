module.exports = {
  method: 'get',
  handle: function() {
    throw new Error('meh');
  }
};
