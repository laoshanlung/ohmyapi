module.exports = {
  path: 'users/:id',
  method: 'get',
  args: {
    id: {
      numericality: {
        onlyInteger: true
      }
    },
    name: {
      default: 'meh'
    }
  },
  handle: function(args) {
    return args;
  }
};
