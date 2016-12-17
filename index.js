import Botkit from "botkit"

import Users from "./lib/users"
import fetchPullRequests from "./lib/fetchPullRequests"
import reportPullRequests from "./lib/reportPullRequests"
import type { PullRequest, PullRequestID, User } from "./lib/types"

const { NODE_ENV } = process.env

const REPORT_INTERVAL = (NODE_ENV === "development" ? 60 : 3600) * 1000

function sortPullRequestsByID(pullRequests: PullRequest[]): PullRequest[] {
  return pullRequests.sort((a, b) => {
    if (a.id > b.id) {
      return 1
    }
    if (a.id < b.id) {
      return -1
    }
    return 0
  })
}

function processPullRequestsForUser(bot: any, user: User, alwaysReport: boolean) {
  fetchPullRequests(user.githubToken).then(pullRequests => {
    const sortedPullRequests = sortPullRequestsByID(pullRequests)
    Users.updateLastKnownPullRequestIDs(user, sortedPullRequests.map(({ id }) => id))

    let newPullRequests
    if (!alwaysReport) {
      newPullRequests = sortedPullRequests.filter(pullRequest => {
        return !user.lastKnownPullRequestIDs.includes(pullRequest.id)
      })
    }

    reportPullRequests(bot, user.slackHandle, newPullRequests || sortedPullRequests, alwaysReport)
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
    console.log(users)
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
  var help = "I will respond to the following messages: \n" +
      "`register` to start tracking open PRs assigned to you.\n" +
      "`unregister` to stop tracking open PRs assigned to you.\n" +
      "`list` to see the full list of open PRs assigned to you.\n" +
      "`help` to see this again."
  bot.reply(message, help)
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
