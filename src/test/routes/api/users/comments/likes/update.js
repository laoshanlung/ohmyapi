module.exports = {
  method: 'put',
  path: 'users/:userId/comments/:commentId/likes',
  args: {
    isAdmin: {
      default: false
    },
    test: {
      boolean: true
    }
  },
  authorize: [
    'isAdmin',
    (args, ctx) => {
      return Promise.resolve(!!args.test);
    }
  ],
  handle: function(args, ctx) {
    return {args, ctx};
  }
};
