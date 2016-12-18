"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchPullRequests;

var _fetchIssuesPage = require("./fetchIssuesPage");

var _fetchIssuesPage2 = _interopRequireDefault(_fetchIssuesPage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function extractPullRequests(issues) {
  return issues.filter(function (issue) {
    return issue.pull_request;
  }).map(function (issue) {
    return {
      id: issue.repository.name + "#" + issue.number,
      number: issue.number,
      url: issue.html_url,
      title: issue.title,
      repo: issue.repository.name
    };
  });
}

function sortPullRequestsByID(pullRequests) {
  return pullRequests.sort(function (a, b) {
    if (a.id > b.id) {
      return 1;
    }
    if (a.id < b.id) {
      return -1;
    }
    return 0;
  });
}

function _fetchPullRequests(token, page, pullRequests) {
  return (0, _fetchIssuesPage2.default)(token, page).then(function (response) {
    pullRequests = pullRequests.concat(extractPullRequests(response.body));
    var link = response.header["link"];
    if (link && link.includes('rel="last"')) {
      return _fetchPullRequests(token, page + 1, pullRequests);
    } else {
      return sortPullRequestsByID(pullRequests);
    }
  });
}

function fetchPullRequests(token) {
  return _fetchPullRequests(token, 1, []);
}