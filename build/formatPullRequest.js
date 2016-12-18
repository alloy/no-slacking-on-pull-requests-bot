"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = formatPullRequest;
function formatPullRequest(pullRequest) {
  return {
    title: pullRequest.id + ": " + pullRequest.title,
    title_link: pullRequest.url
  };
}