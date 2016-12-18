"use strict";

require("babel-polyfill");

var _botkit = require("botkit");

var _botkit2 = _interopRequireDefault(_botkit);

var _users = require("./users");

var _users2 = _interopRequireDefault(_users);

var _fetchPullRequests = require("./fetchPullRequests");

var _fetchPullRequests2 = _interopRequireDefault(_fetchPullRequests);

var _reportPullRequests = require("./reportPullRequests");

var _reportPullRequests2 = _interopRequireDefault(_reportPullRequests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NODE_ENV = process.env.NODE_ENV;


var REPORT_INTERVAL = (NODE_ENV === "development" ? 60 : 3600) * 1000;

function processPullRequestsForUser(bot, user, alwaysReport) {
  (0, _fetchPullRequests2.default)(user.githubToken).then(function (pullRequests) {
    _users2.default.updateLastKnownPullRequestIDs(user, pullRequests.map(function (_ref) {
      var id = _ref.id;
      return id;
    }));

    var newPullRequests = void 0;
    if (!alwaysReport) {
      newPullRequests = pullRequests.filter(function (pullRequest) {
        return !user.lastKnownPullRequestIDs.includes(pullRequest.id);
      });
    }

    (0, _reportPullRequests2.default)(bot, user.slackHandle, newPullRequests || pullRequests, alwaysReport);
  }).catch(function (error) {
    if (error.status === 401) {
      _users2.default.remove(user.slackHandle);
      bot.startPrivateConversation({ user: user.slackHandle }, function (slackError, convo) {
        if (slackError) {
          console.error("Slack Bot error:", slackError);
        } else {
          convo.say("Your token appears to not be valid, please register again.", { action: "completed" });
        }
      });
    } else {
      console.error("An error occurred while fetching pull requests!", error);
    }
  });
}

function reportPullRequestsToAll(bot) {
  _users2.default.all().then(function (users) {
    users.forEach(function (user) {
      return processPullRequestsForUser(bot, user, false);
    });
  });
}

var controller = _botkit2.default.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
});

controller.spawn({
  token: process.env.SLACK_TOKEN,
  retry: Infinity
}).startRTM(function (err, bot, payload) {
  if (err) {
    throw new Error(err);
  }
  console.log("Connected to Slack RTM");

  reportPullRequestsToAll(bot);
  setInterval(reportPullRequestsToAll, REPORT_INTERVAL, bot);
});

controller.hears("help", ["direct_message"], function (bot, message) {
  var help = "I will respond to the following messages: \n" + "`register` to start tracking open PRs assigned to you.\n" + "`unregister` to stop tracking open PRs assigned to you.\n" + "`list` to see the full list of open PRs assigned to you.\n" + "`help` to see this again.";
  bot.reply(message, help);
});

controller.hears("list", ["direct_message"], function (bot, message) {
  _users2.default.get(message.user).then(function (user) {
    processPullRequestsForUser(bot, user, true);
  });
});

controller.hears("unregister", ["direct_message"], function (bot, message) {
  _users2.default.remove(message.user);
  bot.reply(message, "Going at it alone, ey? I salute you, brave one.");
});

controller.hears("register", ["direct_message"], function (bot, message) {
  var matches = message.text.match(/^register ([a-z0-9-]{0,38})\s*([a-z0-9]+)?/i);
  if (matches) {
    var user = {
      slackHandle: message.user,
      githubHandle: matches[1],
      githubToken: matches[2],
      lastKnownPullRequestIDs: []
    };
    _users2.default.set(user);
    processPullRequestsForUser(bot, user, true);
  } else {
    bot.reply(message, "Usage: `register github-handle access-token`");
  }
});

controller.hears(".*", ["direct_message", "direct_mention"], function (bot, message) {
  bot.reply(message, "Sorry <@" + message.user + ">, I don't understand. \n");
});