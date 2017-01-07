// @flow

if (!global._babelPolyfill) {
  require("babel-polyfill")
}

import Botkit from "botkit"

import fetchPullRequests from "./fetchPullRequests"
import reportPullRequests from "./reportPullRequests"
import { COMMIT_LINK } from "./git"
import Users from "./users"
import type { User } from "./types"

const { NODE_ENV } = process.env

// Check each minute in development, each half hour in production.
const REPORT_INTERVAL = (NODE_ENV === "development" ? 60 : 1800) * 1000

function processPullRequestsForUser(bot: any, user: User, alwaysReport: boolean) {
  fetchPullRequests(user.githubToken).then(pullRequests => {
    Users.updateLastKnownPullRequestIDs(user, pullRequests.map(({ id }) => id))

    let newPullRequests
    if (!alwaysReport) {
      newPullRequests = pullRequests.filter(pullRequest => {
        return !user.lastKnownPullRequestIDs.includes(pullRequest.id)
      })
    }

    reportPullRequests(bot, user.slackHandle, newPullRequests || pullRequests, alwaysReport)
  }).catch(error => {
    if (error.status === 401) {
      Users.remove(user.slackHandle)
      bot.startPrivateConversation({ user: user.slackHandle }, (slackError, convo) => {
        if (slackError) {
          console.error("Slack Bot error:", slackError)
        } else {
          convo.say("Your token appears to not be valid, please register again.", { action: "completed" })
        }
      })
    } else {
      console.error("An error occurred while fetching pull requests!", error)
    }
  })
}

function reportPullRequestsToAll(bot: any) {
  Users.all().then(users => {
    users.forEach(user => processPullRequestsForUser(bot, user, false))
  })
}

const controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false,
})

controller.spawn({
  token: process.env.SLACK_TOKEN,
  retry: Infinity,
}).startRTM((err, bot, payload) => {
  if (err) {
    throw new Error(err)
  }
  console.log("Connected to Slack RTM")

  reportPullRequestsToAll(bot)
  setInterval(reportPullRequestsToAll, REPORT_INTERVAL, bot)
})

controller.hears("help", ["direct_message"], (bot, message) => {
  const help = "I will respond to the following messages: \n" +
      "`register` to start tracking open PRs assigned to you.\n" +
      "`unregister` to stop tracking open PRs assigned to you.\n" +
      "`list` to see the full list of open PRs assigned to you.\n" +
      "`version` to see details about the version of the bot.\n" +
      "`who` to see who has installed the bot.\n" +
      "`help` to see this again."
  bot.reply(message, help)
})

controller.hears("version", ["direct_message"], (bot, message) => {
  bot.reply(message, COMMIT_LINK)
})

controller.hears("who", ["direct_message"], (bot, message) => {
  Users.all()
    .then(users => {
      const people = users.map(user => user.slackHandle).join(", ")
      bot.reply(message, `Currrently logged in: ${people}`)
    })
})

controller.hears("list", ["direct_message"], (bot, message) => {
  Users.get(message.user)
    .then(user => {
      processPullRequestsForUser(bot, user, true)
    })
    .catch(error => {
      if (error.notRegistered) {
        bot.reply(message, "Love the enthusiasm, but please register first :pray:")
      } else {
        console.error(error)
      }
    })
})

controller.hears("unregister", ["direct_message"], (bot, message) => {
  Users.remove(message.user)
  bot.reply(message, "Going at it alone, ey? I tip my hat to you, brave one. :tophat::ok_hand:")
})

controller.hears("register", ["direct_message"], (bot, message) => {
  var matches = message.text.match(/^register ([a-z0-9-]{0,38})\s*([a-z0-9]+)?/i)
  if (matches) {
    const user: User = {
      slackHandle: message.user,
      githubHandle: matches[1],
      githubToken: matches[2],
      lastKnownPullRequestIDs: [],
    }
    Users.set(user)
    processPullRequestsForUser(bot, user, true)
  } else {
    bot.reply(message, "Usage: `register github-handle access-token`")
    bot.reply(message, {
      attachments: [{
        title: "Generate a token with full repo access ➲",
        title_link: "https://github.com/settings/tokens/new",
      }],
    })
  }
})

controller.hears(".*", ["direct_message", "direct_mention"], (bot, message) => {
  bot.reply(message, "Sorry <@" + message.user + ">, I don't understand. \n")
})
