module.exports = {
  method: 'post',
  path: 'users/:userId/comments/:commentId/likes',
  args: {
    content: {
      presence: true
    }
  },
  handle: function(args, ctx) {
    return {args, ctx};
  }
};
