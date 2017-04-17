const express = require('express'),
      _ = require('lodash'),
      Promise = require('bluebird'),
      bodyParser = require('body-parser'),
      cookieParser = require('cookie-parser');

function buildContext(req) {
  return {
    cookies: _.cloneDeep(req.cookies),
    params: _.cloneDeep(req.params),
    query: _.cloneDeep(req.query),
    body: _.cloneDeep(req.body),
    path: req.originalUrl,
    headers: _.cloneDeep(req.headers),
    session: req.session
  };
};

function getInput(req) {
  return Object.assign({}, req.query, req.body, req.params);
}

module.exports = function(routes, options = {}) {
  const {
    app = express(),
    before,
    after,
    prefix = '',
    success = function(data) {
      return {
        data,
        success: true,
        error: null
      };
    },
    failure = function(error) {
      return {
        data: null,
        success: false,
        error: {
          message: error.message,
          data: error.data || null
        }
      };
    }
  } = options;

  if (!routes || !routes.length) throw new Error('Empty routes');

  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  if (before && _.isFunction(before)) before.call(app, app, options);

  routes.forEach((route) => {
    const path = route.getPath(),
          method = route.getMethod(),
          args = route.getArgs();

    app[method](`${prefix}${path}`, function(req, res) {
      let input = getInput(req);
      const context = buildContext(req);

      return route.run(input, context).then((result) => {
        res.json(success(result));
      })
      .catch((error) => {
        const status = error.status || 400;
        res.status(status).json(failure(error));
      });
    });
  });

  if (after && _.isFunction(after)) after.call(app, app, options);

  return app;
};
