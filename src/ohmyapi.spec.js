const ohmyapi = require('./ohmyapi');

function test(engine, validator) {
  describe(`${engine} engine and ${validator} validator`, () => {
    let app;

    beforeEach(() => {
      app = ohmyapi(`${__dirname}/test/routes/${engine}/api`)
        .engine(engine, {
          prefix: '/api'
        })
        .authenticate((args, ctx) => {
          return args.authenticated;
        })
        .authorize({
          isAuthenticated(args, ctx) {
            return args.authenticated;
          },
          isAdmin(args, ctx) {
            return args.isAdmin;
          }
        })
        .init();
    });

    it('should return correct format', async () => {
      const res = await callApi(app, {
        path: '/api/status',
        method: 'get'
      });

      expect(res.body).to.eql({
        data: {
          status: 'ok'
        },
        success: true,
        error: null
      });
    });

    it('should handle error', async () => {
      const res = await callApi(app, {
        path: '/api/users/count',
        method: 'get'
      });

      expect(res.body).to.eql({
        data: null,
        success: false,
        error: {
          data: null,
          message: 'meh'
        }
      });
    });

    it('should validate input using args option', async () => {
      const res = await callApi(app, {
        path: '/api/users/1/comments/2/likes',
        method: 'post'
      });

      expect(res.body).to.eql({
        data: null,
        success: false,
        error: {
          message: 'Invalid input',
          data: {
            content: ['Content can\'t be blank']
          }
        }
      });
    });

    it('should filter request args', async () => {
      const res = await callApi(app, {
        path: '/api/users/1',
        data: {
          test: 1
        },
        method: 'get'
      });

      expect(res.body).to.eql({
        data: {
          id: 1,
          name: 'meh'
        },
        success: true,
        error: null
      });
    });

    it('should reject unauthenticated requests', async () => {
      const res = await callApi(app, {
        path: '/api/users/1/comments',
        method: 'get'
      });

      expect(res.body).to.eql({
        data: null,
        success: false,
        error: {
          message: 'Unauthenticated request',
          data: null
        }
      });
    });

    it('should accept authenticated requests', async () => {
      const res = await callApi(app, {
        path: '/api/users/1/comments',
        method: 'get',
        data: {
          authenticated: true
        }
      });

      expect(res.body).to.eql({
        data: {
          authenticated: true
        },
        success: true,
        error: null
      });
    });

    it('should reject unauthorized requests', async () => {
      const res = await callApi(app, {
        path: '/api/users/1/comments/1/likes',
        method: 'put'
      });

      expect(res.body).to.eql({
        data: null,
        success: false,
        error: {
          message: 'Unauthorized request',
          data: null
        }
      });
    });

    it('should support app-level authorization', async () => {
      const res = await callApi(app, {
        path: '/api/users/1/comments/1/likes',
        method: 'put',
        data: {
          isAdmin: true
        }
      });

      expect(res.body.data.args).to.eql({
        isAdmin: true
      });
    });

    it('should support route-level authorization', async () => {
      const res = await callApi(app, {
        path: '/api/users/1/comments/1/likes',
        method: 'put',
        data: {
          test: true
        }
      });

      expect(res.body.data.args).to.eql({
        isAdmin: false,
        test: true
      });
    });

  });
}

describe('ohmyapi', () => {
  const engines = [
    'express'
  ];

  const validators = [
    'default'
  ];

  engines.forEach((engine) => {
    validators.forEach((validator) => {
      test(engine, validator);
    });
  });
});
