const _ = require('lodash'),
      Promise = require('bluebird'),
      fs = require('fs');

function throwIfMissingOption(name, options) {
  if (options[name] === undefined) throw new Error(`Missing option ${name}`);
}

const REQUIRED_OPTIONS = [
  'path',
  'handle'
];

function isOptionalFunction(value) {
  if (!value) return true;
  return _.isFunction(value);
}

const OPTIONS = {
  path: {
    required: true,
    type: _.isString
  },
  handle: {
    required: true,
    type: _.isFunction
  },
  validate: {
    type: isOptionalFunction
  },
  filter: {
    type: isOptionalFunction
  },
  authenticate: {
    type: function(value) {
      if (_.isBoolean(value)) return value;
      return isOptionalFunction(value);
    }
  },
  authorize: {
    type: function(value) {
      if (!value) return true;
      return _.isFunction(value) || _.isArray(value);
    }
  },
  args: {
    type: function(value) {
      return _.isObject(value) && !_.isArray(value);
    },
    default: {}
  },
  method: {
    type: _.isString,
    default: 'get'
  }
};

class Unauthenticated extends Error {
  constructor(props) {
    super(props);

    this.message = 'Unauthenticated request';
    this.status = 403;
    this.code = 403;
    this.data = null;
  }
}

class Unauthorized extends Error {
  constructor(props) {
    super(props);

    this.message = 'Unauthorized request';
    this.status = 403;
    this.code = 403;
    this.data = null;
  }
}

class Route {
  constructor(options = {}) {
    _.forEach(OPTIONS, (opt, name) => {
      if (opt.required === true) throwIfMissingOption(name, options);

      let value = options[name];
      if (!_.isUndefined(opt.default) && _.isUndefined(value)) value = opt.default;

      const type = opt.type;
      if (_.isFunction(type) && !type(value) && !_.isUndefined(value)) {
        // TODO somehow show the type in the error message
        throw new Error(`Option ${name} has wrong type: ${value}`);
      }

      this[name] = value;
    });
  }

  getPath() {
    return this.path;
  }

  getMethod() {
    return this.method.toLowerCase();
  }

  getArgs() {
    return this.args;
  }

  run(input, ctx) {
    const {
      args,
      handle,
      validate,
      filter,
      authenticate,
      authorize
    } = this;

    return Promise.try(() => {
      if (filter) {
        input = filter(input, args, ctx);
      }
    }).then(() => {
      if (!authenticate) return true;
      return authenticate(input, ctx);
    }).then((result) => {
      if (!result) throw new Unauthenticated;
      if (!authorize) return true;
      return authorize(input, ctx);
    }).then((result) => {
      if (!result) throw new Unauthorized;
    }).then(() => {
      if (validate) return validate(input, args, ctx);
      return true;
    }).then(() => {
      return handle(input, ctx);
    });
  }
}

function loadRoutes(dirname, root) {
  return _.chain(fs.readdirSync(dirname))
  .map((fileName) => {
    const absolutePath = `${dirname}/${fileName}`;
    const stats = fs.lstatSync(absolutePath);

    if (stats.isDirectory()) {
      return loadRoutes(absolutePath, root);
    } else if (stats.isFile()) {
      const routeConfig = require(absolutePath);
      return Object.assign({
        path: absolutePath.split(root).join('').split('.')[0]
      }, routeConfig);
    }
  })
  .flatten().value();
}

Route.loadRoutes = function(dirname, routeOptions) {
  const routes = loadRoutes(dirname, dirname);

  return routes.map((route) => {
    let path = route.path;
    if (path.charAt(0) !== '/') path = '/' + path;
    route.path = path;

    if (_.isFunction(routeOptions)) {
      Object.assign(route, routeOptions(route));
    }

    return route;
  }).map((route) => {
    return new Route(route);
  });
};

module.exports = Route;
