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
    type: _.isFunction
  },
  filter: {
    type: _.isFunction
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
      filter
    } = this;

    if (filter) {
      input = filter(input, args, ctx);
    }

    return Promise.try(() => {
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

Route.loadRoutes = function(dirname, routeOptions = {}) {
  const routes = loadRoutes(dirname, dirname);

  return routes.map((route) => {
    let path = route.path;
    if (path.charAt(0) !== '/') path = '/' + path;
    route.path = path;

    return Object.assign(route, routeOptions);
  }).map((route) => {
    return new Route(route);
  });
};

module.exports = Route;
