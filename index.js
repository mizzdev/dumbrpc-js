'use strict';

const EventEmitter = require('events').EventEmitter;

class RPCManager extends EventEmitter {
  constructor() {
    super();

    this.local = {};
    this.remote = {};
  }

  registerRemote(methodName) {
    const self = this;

    self.remote[methodName] = function(...args) {
      let callback = (err) => {
        if (err) { throw err; }
      };

      if (typeof args[args.length - 1] === 'function') {
        callback = args.pop();
      }

      self.emit('remote', {
        method: methodName,
        params: args
      }, callback);
    };
  }

  registerLocal(methodName, fn) {
    const self = this;

    self.local[methodName] = (params, callback) => {
      params.push((err, result) => {
        if (err) {
          return callback(err, {
            result: null,
            error: err.message
          });
        }

        callback(null, {
          result: result,
          error: null
        });
      });
      const method = fn.apply(null, params);
    };
  }
}

module.exports = () => {
  return new RPCManager();
};
