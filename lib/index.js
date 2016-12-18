// @flow

if (!global._babelPolyfill) {
  require("babel-polyfill")
}

import Botkit from "botkit"

import Users from "./users"
import fetchPullRequests from "./fetchPullRequests"
import reportPullRequests from "./reportPullRequests"
import type { User } from "./types"

const GIT_VERSION = null
const GITHUB_REPO = null
const COMMIT_LINK = GITHUB_REPO && `${GITHUB_REPO.substring(0, GITHUB_REPO.length - 4)}/tree/${GIT_VERSION}`

const { NODE_ENV } = process.env

const REPORT_INTERVAL = (NODE_ENV === "development" ? 60 : 3600) * 1000

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
      "`help` to see this again."
  bot.reply(message, help)
})

controller.hears("version", ["direct_message"], (bot, message) => {
  bot.reply(message, COMMIT_LINK || "Dev version")
})

controller.hears("list", ["direct_message"], (bot, message) => {
  Users.get(message.user).then(user => {
    processPullRequestsForUser(bot, user, true)
  })
})

controller.hears("unregister", ["direct_message"], (bot, message) => {
  Users.remove(message.user)
  bot.reply(message, "Going at it alone, ey? I salute you, brave one.")
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
  }
})

controller.hears(".*", ["direct_message", "direct_mention"], (bot, message) => {
  bot.reply(message, "Sorry <@" + message.user + ">, I don't understand. \n")
})
