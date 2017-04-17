const ohmyapi = require('./ohmyapi');

describe('ohmyapi', () => {
  const routes = __dirname + '/test/routes/api';

  describe('express', () => {
    let app;

    beforeEach(() => {
      app = ohmyapi(routes)
              .engine('express', {
                prefix: '/api'
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
            message: 'Failed to validate request',
            data: {
              content: ['Content can\'t be blank']
            }
          }
        })
      });
    });
  });
});
