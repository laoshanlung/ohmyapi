module.exports = {
  path: 'users/:id/comments',
  method: 'get',
  args: {
    authenticated: {
      default: false
    }
  },
  authenticate: true,
  handle: function(args) {
    return args;
  }
};
