import Botkit from "botkit"
import fetchPullRequests from "./lib/fetchPullRequests"

var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false,
})

var Bot = null

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log("Starting in single-team mode")
  controller.spawn({
    token: token,
    retry: Infinity,
  }).startRTM((err, bot, payload) => {
    if (err) {
      throw new Error(err)
    }
    Bot = bot
    console.log("Connected to Slack RTM")
  })
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log("Starting in Beep Boop multi-team mode")
  require("beepboop-botkit").start(controller, { debug: true })
}

controller.on("bot_channel_join", (bot, message) => {
  bot.reply(message, "I'm here!")
})

controller.hears(["hello", "hi"], ["direct_mention"], (bot, message) => {
  bot.reply(message, "Hello.")
})

controller.hears(["hello", "hi"], ["direct_message"], (bot, message) => {
  bot.reply(message, "Hello.")
  bot.reply(message, "It's nice to talk to you directly.")
})

controller.hears(".*", ["mention"], (bot, message) => {
  bot.reply(message, "You really do care about me. :heart:")
})

controller.hears("help", ["direct_message", "direct_mention"], (bot, message) => {
  var help = "I will respond to the following messages: \n" +
      "`bot hi` for a simple message.\n" +
      "`bot attachment` to see a Slack attachment message.\n" +
      "`@<your bot's name>` to demonstrate detecting a mention.\n" +
      "`bot help` to see this again."
  bot.reply(message, help)
})

controller.hears(["attachment"], ["direct_message", "direct_mention"], (bot, message) => {
  var text = "Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots."
  var attachments = [{
    fallback: text,
    pretext: "We bring bots to life. :sunglasses: :thumbsup:",
    title: "Host, deploy and share your bot in seconds.",
    image_url: "https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png",
    title_link: "https://beepboophq.com/",
    text: text,
    color: "#7CD197",
  }]

  bot.reply(message, {
    attachments: attachments,
  }, (err, resp) => {
    console.log(err, resp)
  })
})

/* --------- */

controller.hears("register", ["direct_message"], (bot, message) => {
  console.log(message)
  var matches = message.text.match(/^register ([a-z0-9-]{0,38})\s*([a-z0-9]+)?/i)
  if (matches) {
    var username = matches[1]
    var token = matches[2]
    // Users[username] = message.user
    // console.log(Users)
    fetchPullRequests(token).then(pullRequests => {
      var attachments = pullRequests.map(pullRequest => {
        return {
          title: `${pullRequest.repo}#${pullRequest.number}: ${pullRequest.title}`,
          title_link: pullRequest.url,
        }
      })
      bot.reply(message, { attachments: attachments })
    })
  } else {
    bot.reply(message, "Usage: `register github-handle access-token`")
  }
})

controller.hears(".*", ["direct_message", "direct_mention"], (bot, message) => {
  bot.reply(message, "Sorry <@" + message.user + ">, I don't understand. \n")
})
