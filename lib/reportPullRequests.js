// @flow

import type { PullRequest, SlackHandle } from "./types"
import formatPullRequest from "./formatPullRequest"

export default function reportPullRequests(
  bot: any,
  slackHandle: SlackHandle,
  pullRequests: PullRequest[],
  alwaysReport: boolean
): void {
  if (pullRequests.length || alwaysReport) {
    bot.startPrivateConversation({ user: slackHandle }, (slackError, convo) => {
      if (slackError) {
        console.error(slackError)
      } else {
        if (pullRequests.length) {
          convo.say({
            action: "completed",
            fallback: `${pullRequests.length} PR was assigned to you.`,
            attachments: pullRequests.map(formatPullRequest),
          })
        } else {
          convo.say("You have no open PRs. Great job!", {
            action: "completed",
          })
        }
      }
    })
  }
}
