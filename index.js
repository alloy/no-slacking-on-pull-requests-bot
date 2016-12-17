import Botkit from "botkit"

import Users from "./lib/users"
import reportPullRequests from "./lib/reportPullRequests"
import type { User } from "./lib/types"

const { NODE_ENV } = process.env

const REPORT_INTERVAL = (NODE_ENV === "development" ? 60 : 3600) * 1000

function reportPullRequestsToAll(bot) {
  Users.all().then(users => {
    users.forEach(user => {
      reportPullRequests(bot, user, false)
    })
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

controller.hears("help", ["direct_message", "direct_mention"], (bot, message) => {
  var help = "I will respond to the following messages: \n" +
      "`bot hi` for a simple message.\n" +
      "`bot attachment` to see a Slack attachment message.\n" +
      "`@<your bot's name>` to demonstrate detecting a mention.\n" +
      "`bot help` to see this again."
  bot.reply(message, help)
})

controller.hears("register", ["direct_message"], (bot, message) => {
  console.log(message)
  var matches = message.text.match(/^register ([a-z0-9-]{0,38})\s*([a-z0-9]+)?/i)
  if (matches) {
    const user: User = {
      slackHandle: message.user,
      githubHandle: matches[1],
      githubToken: matches[2],
    }
    Users.set(user)
    reportPullRequests(bot, user, true)
  } else {
    bot.reply(message, "Usage: `register github-handle access-token`")
  }
})

controller.hears(".*", ["direct_message", "direct_mention"], (bot, message) => {
  bot.reply(message, "Sorry <@" + message.user + ">, I don't understand. \n")
})
