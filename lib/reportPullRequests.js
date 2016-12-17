// @flow

import type { User } from "./types"
import fetchPullRequests from "./fetchPullRequests"
import formatPullRequest from "./formatPullRequest"

const { NODE_ENV } = process.env

export default function reportPullRequests(bot: any, user: User, alwaysReport: boolean): Promise<void> {
  return fetchPullRequests(user.githubToken)
    .then(pullRequests => {
      bot.startPrivateConversation({ user: user.slackHandle }, (slackError, convo) => {
        if (slackError) {
          console.error(slackError)
        } else {
          if (pullRequests.length) {
            convo.say({ attachments: pullRequests.map(formatPullRequest) })
          } else if (alwaysReport) {
            convo.say("You have no open PRs. Great job!")
          }
        }
      })
    })
    .catch(error => {
      if (NODE_ENV !== "test") {
        console.error(error)
      }
      if (alwaysReport) {
        bot.startPrivateConversation({ user: user.slackHandle }, (slackError, convo) => {
          if (slackError) {
            console.error(slackError)
          } else {
            convo.say(`Ah bugger, an error occurred: ${error.message}`)
          }
        })
      }
    })
}
