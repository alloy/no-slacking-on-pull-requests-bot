"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchIssuesPage;

var _superagent = require("superagent");

var _superagent2 = _interopRequireDefault(_superagent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fetchIssuesPage(token, page) {
  return _superagent2.default.get("https://api.github.com/orgs/artsy/issues").query({ state: "open", filter: "assigned", page: page }).set("Authorization", "token " + token).accept("json");
}