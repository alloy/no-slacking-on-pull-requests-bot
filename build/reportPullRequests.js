"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = reportPullRequests;

var _formatPullRequest = require("./formatPullRequest");

var _formatPullRequest2 = _interopRequireDefault(_formatPullRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function reportPullRequests(bot, slackHandle, pullRequests, alwaysReport) {
  if (pullRequests.length || alwaysReport) {
    bot.startPrivateConversation({ user: slackHandle }, function (slackError, convo) {
      if (slackError) {
        console.error(slackError);
      } else {
        if (pullRequests.length) {
          convo.say({ action: "completed", attachments: pullRequests.map(_formatPullRequest2.default) });
        } else {
          convo.say("You have no open PRs. Great job!", { action: "completed" });
        }
      }
    });
  }
}