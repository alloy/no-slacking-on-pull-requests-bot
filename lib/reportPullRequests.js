// @flow

import type { PullRequest, SlackHandle } from "./types"
import formatPullRequest from "./formatPullRequest"

export default function reportPullRequests(
  bot: any,
  slackHandle: SlackHandle,
  pullRequests: PullRequest[],
  alwaysReport: boolean
): void {
  bot.startPrivateConversation({ user: slackHandle }, (slackError, convo) => {
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
}
