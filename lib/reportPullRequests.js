// @flow

import type { PullRequest, SlackHandle } from "./types"

function formatMessage(pullRequests: PullRequest[]): string {
  const count = pullRequests.length
  return `${count} ${count === 1 ? "PR has" : "PRs have"} been assigned to you.`
}

function formatPullRequest(pullRequest: PullRequest): string {
  const title = pullRequest.title.replace("<", "&lt;").replace(">", "&gt;")
  return `<${pullRequest.url}|${pullRequest.id}: ${title}>`
}

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
          const message = formatMessage(pullRequests)
          convo.say({
            action: "completed",
            attachments: [{
              fallback: message,
              text: `${message}\n${pullRequests.map(formatPullRequest).join("\n")}`,
            }],
          })
        } else {
          convo.say("You have no open PRs. Great job! :clap:", {
            action: "completed",
          })
        }
      }
    })
  }
}
