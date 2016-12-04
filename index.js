import Botkit from "botkit"
// var request = require("superagent")

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

// function mapPullRequests(pullRequests: any[]) {
//   return pullRequests.map((pullRequest) => {
//     return {
//       url: pullRequest.html_url,
//       createdAt: pullRequest.created_at,
//       title: pullRequest.title,
//       repo: pullRequest.repository.name,
//       number: pullRequest.number
//     }
//   })
// }

// function fetchPullRequests(
//     token: string,
//     callback: (pullRequests: any[]) => void,
//     pullRequests: any[] = [],
//     page: number = 1
//   ) {
//   console.log("Request page " + page)
//   request
//     .get("https://api.github.com/orgs/artsy/issues")
//     .query({ state: "open", filter: "assigned", page: page })
//     .set("Authorization", "token " + token)
//     .accept("json")
//     .catch((error) => console.log("ERROR: " + error))
//     .then((response) => {
//       pullRequests = pullRequests.concat(response.body.filter((issue) => issue.pull_request))
//       var link = response.header["link"]
//       if (link && link.includes('rel="last"')) {
//         fetchPullRequests(token, callback, pullRequests, page + 1)
//       } else {
//         callback(pullRequests)
//       }
//     })
// }

// function fetchPullRequestEvents(token, username) {
//   request
//     .get('https://api.github.com/users/' + username + '/events/orgs/artsy')
//     .set('Authorization', 'token ' + token)
//     .accept('json')
//     .catch(function(error) { console.log('ERROR: ' + error); })
//     .then(function(response) {
//       var etag = response.header['etag'];
//       var interval = response.header['x-poll-interval'];
//       var events = response.body.filter(function (event) { return event.type === 'PullRequestEvent'; });
//       console.log(events);
//     });
// }

controller.hears("register", ["direct_message"], (bot, message) => {
  console.log(message)
  var matches = message.text.match(/^register ([a-z0-9-]{0,38})\s*([a-z0-9]+)?/i)
  if (matches) {
    // var username = matches[1]
    // Users[username] = message.user
    // console.log(Users)
    // var token = matches[2];
    // fetchPullRequests(token, function (pullRequests) {
    //   var attachments = mapPullRequests(pullRequests).map(function (pullRequest) {
    //     return {
    //       title: pullRequest.repo + '#' + pullRequest.number + ': ' + pullRequest.title,
    //       title_link: pullRequest.url,
    //     };
    //   });
    //   bot.reply(message, { attachments: attachments });
    // });
  } else {
    bot.reply(message, "Usage: `register github-handle access-token`")
  }
})

controller.hears(".*", ["direct_message", "direct_mention"], (bot, message) => {
  bot.reply(message, "Sorry <@" + message.user + ">, I don't understand. \n")
})
