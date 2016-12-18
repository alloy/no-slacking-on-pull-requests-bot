"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _beepboopPersist = require("beepboop-persist");

var _beepboopPersist2 = _interopRequireDefault(_beepboopPersist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NODE_ENV = process.env.NODE_ENV;


var config = NODE_ENV === "development" ? { provider: "fs", directory: __dirname + "/../tmp" } : {};

var Users = {
  _storage: (0, _beepboopPersist2.default)(config),

  set: function set(user) {
    return new Promise(function (resolve, reject) {
      Users._storage.set(user.slackHandle, user, function (err) {
        return err ? reject(err) : resolve();
      });
    });
  },

  get: function get(slackHandle) {
    return new Promise(function (resolve, reject) {
      Users._storage.get(slackHandle, function (err, user) {
        if (err) {
          reject(err);
        } else if (user) {
          resolve(user);
        } else {
          reject(new Error("The requested user is not registered."));
        }
      });
    });
  },

  updateLastKnownPullRequestIDs: function updateLastKnownPullRequestIDs(user, pullRequestIDs) {
    return Users.set(Object.assign({}, user, { lastKnownPullRequestIDs: pullRequestIDs }));
  },

  remove: function remove(slackHandle) {
    return new Promise(function (resolve, reject) {
      Users._storage.del(slackHandle, function (err) {
        return err ? reject(err) : resolve();
      });
    });
  },

  all: function all() {
    return new Promise(function (resolve, reject) {
      Users._storage.list(function (err, slackHandles) {
        err ? reject(err) : resolve(Promise.all(slackHandles.map(Users.get)));
      });
    });
  }
};

exports.default = Users;