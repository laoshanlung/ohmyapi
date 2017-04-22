const ohmyapi = require('./ohmyapi');

describe('ohmyapi', () => {
  const routes = __dirname + '/test/routes/api';

  const engines = [
    'express'
  ];

  engines.forEach((engine) => {
    describe(engine, () => {
      let app;

      beforeEach(() => {
        app = ohmyapi(routes)
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

      it('should return correct format', () => {
        return callApi(app, {
          path: '/api/status',
          method: 'get'
        }).then((res) => {
          expect(res.body).to.eql({
            data: {
              status: 'ok'
            },
            success: true,
            error: null
          });
        });
      });

      it('should handle error', () => {
        return callApi(app, {
          path: '/api/users/count',
          method: 'get'
        }).then((res) => {
          expect(res.body).to.eql({
            data: null,
            success: false,
            error: {
              data: null,
              message: 'meh'
            }
          });
        });
      });

      it('should validate input using args option', () => {
        return callApi(app, {
          path: '/api/users/1/comments/2/likes',
          method: 'post'
        }).then((res) => {
          expect(res.body).to.eql({
            data: null,
            success: false,
            error: {
              message: 'Invalid input',
              data: {
                content: ['Content can\'t be blank']
              }
            }
          })
        });
      });

      it('should filter request args', () => {
        return callApi(app, {
          path: '/api/users/1',
          data: {
            test: 1
          },
          method: 'get'
        }).then((res) => {
          expect(res.body).to.eql({
            data: {
              id: 1,
              name: 'meh'
            },
            success: true,
            error: null
          });
        });
      });

      it('should reject unauthenticated requests', () => {
        return callApi(app, {
          path: '/api/users/1/comments',
          method: 'get'
        }).then((res) => {
          expect(res.body).to.eql({
            data: null,
            success: false,
            error: {
              message: 'Unauthenticated request',
              data: null
            }
          });
        });
      });

      it('should accept authenticated requests', () => {
        return callApi(app, {
          path: '/api/users/1/comments',
          method: 'get',
          data: {
            authenticated: true
          }
        }).then((res) => {
          expect(res.body).to.eql({
            data: {
              authenticated: true
            },
            success: true,
            error: null
          });
        });
      });

      it('should reject unauthorized requests', () => {
        return callApi(app, {
          path: '/api/users/1/comments/1/likes',
          method: 'put'
        }).then((res) => {
          expect(res.body).to.eql({
            data: null,
            success: false,
            error: {
              message: 'Unauthorized request',
              data: null
            }
          });
        });
      });

      it('should support app-level authorization', () => {
        return callApi(app, {
          path: '/api/users/1/comments/1/likes',
          method: 'put',
          data: {
            isAdmin: true
          }
        }).then((res) => {
          expect(res.body.data.args).to.eql({
            isAdmin: true
          });
        });
      });

      it('should support route-level authorization', () => {
        return callApi(app, {
          path: '/api/users/1/comments/1/likes',
          method: 'put',
          data: {
            test: true
          }
        }).then((res) => {
          expect(res.body.data.args).to.eql({
            isAdmin: false,
            test: true
          });
        });
      });

    });
  });
});
