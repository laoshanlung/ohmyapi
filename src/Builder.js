const Route = require('./Route'),
      _ = require('lodash'),
      fs = require('fs'),
      engines = require('./engines'),
      validators = require('./validators'),
      filters = require('./filters'),
      Promise = require('bluebird');

class Builder {
  constructor(routes) {
    if (!routes) throw new Error('Missing path to load routes');

    if (!fs.lstatSync(routes).isDirectory()) throw new Error(`${routes} is not a directory`);

    this.pathToLoadRoutes = routes;
    this.routes = []; // this will be populated later
  }

  /**
   * engine('express', {}) -> set the engine to express
   * engine(function(routes) {}) -> custom function to build the engine
   */
  engine(name, options = {}) {
    if (_.isFunction(name)) {
      this._engine = () => {
        return name.call(null, this.routes, options);
      };
    } else if (_.isString(name)) {
      const engine = engines[name];
      if (!engine) throw new Error(`Engine ${name} is not found`);

      this._engine = () => {
        return engine.call(null, this.routes, options);
      };
    }

    return this;
  }

  /**
   * validate('default', {}) -> set the validator to default
   * validate(function(values, args, options) {}) -> custom validator
   */
  validate(name, options = {}) {
    if (_.isFunction(name)) {
      this._validate = name;
    } else if (_.isString(name)) {
      const validate = validators[name];

      if (!validate) throw new Error(`${name} is not a valid validate function`);

      this._validate = validate;
    }

    return this;
  }

  /**
   * filter('default', {}) -> set the filter to default
   * filter(function(values, args, options) {}) -> custom filter
   */
  filter(name, options = {}) {
    if (_.isFunction(name)) {
      this._filter = name;
    } else if (_.isString(name)) {
      const filter = filters[name];

      if (!filter) throw new Error(`Filter ${name} is not found`);

      this._filter = filter;
    }

    return this;
  }

  authenticate(fn) {
    if (!_.isFunction(fn)) throw new Error('Authenticate must be a function');

    this._authenticate = fn;

    return this;
  }

  authorize(auth) {
    if (
      _.isArray(auth)
      || !_.isObject(auth)
    ) throw new Error('Authorize must be an object');

    this._authorize = auth;

    return this;
  }

  _authorizeRoute(route) {
    const appAuthorization = this._authorize || {};

    const routeAuthorization = _.chain(
      _.isArray(route.authorize) ?
      route.authorize : [route.authorize]
    ).compact()
    .filter((auth) => {
      return (_.isString(auth) && appAuthorization[auth])
        || _.isFunction(auth);
    })
    .map((auth) => {
      if (_.isFunction(auth)) return auth;
      return appAuthorization[auth];
    })
    .value();

    if (_.isEmpty(routeAuthorization)) return null;

    return function(args, ctx) {
      return Promise.mapSeries(routeAuthorization, (auth) => {
        return auth(args, ctx);
      }).then(_.compact).then((results) => {
        return !!results.length;
      });
    };
  }

  init() {
    if (!this._engine) {
      this.engine('express', {
        prefix: '/api'
      });
    }

    if (!this._validate) {
      this.validate('default');
    }

    if (!this._filter) {
      this.filter('default');
    }

    this.routes = Route.loadRoutes(this.pathToLoadRoutes, (route) => {
      let authenticate = this._authenticate;
      if (_.isFunction(route.authenticate)) {
        authenticate = route.authenticate;
      } else if (!route.authenticate) {
        authenticate = null;
      }

      const authorize = this._authorizeRoute(route);

      return {
        validate: this._validate,
        filter: this._filter,
        authenticate,
        authorize
      };
    });

    return this._engine();
  }
}

module.exports = Builder;
