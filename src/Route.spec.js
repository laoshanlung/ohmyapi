const Route = require('./Route'),
      _ = require('lodash'),
      expect = require('chai').expect;

describe('Route', () => {
  describe('.loadRoutes', () => {
    it('should recursively load routes from a directory', () => {
      const routes = Route.loadRoutes(`${__dirname}/test/routes/api`);
      expect(routes.length).to.equal(5);

      expect(_.map(routes, 'args')).to.eql([
        {},
        {
          content: {
            presence: true
          }
        },
        {},
        {},
        {}
      ]);

      expect(_.map(routes, 'path')).to.eql([
        '/status',
        '/users/:userId/comments/:commentId/likes',
        '/users/:id/comments',
        '/users/count',
        '/users/:id'
      ]);
    });
  });
});
