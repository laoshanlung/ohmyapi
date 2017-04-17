const request = require('supertest'),
      Promise = require('bluebird');

global.expect = require('chai').expect;
global.sinon = require('sinon');

global.callApi = (app, params = {}) => {
  const req = request(app);

  return new Promise((resolve, reject) => {
    const method = (params.method || 'get').toLowerCase();

    let pendingReq = req[method]
      .call(req, params.path);

    if (method === 'get') {
      pendingReq.query(params.data || {})
    } else {
      pendingReq.send(params.data || {});
    }

    pendingReq.end((error, res) => {
      if (error) return reject(error);
      resolve(res);
    });
  });
};
