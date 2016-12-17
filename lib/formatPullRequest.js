// @flow

import type { BotKitAttachment, PullRequest } from "./types"

export default function formatPullRequest(pullRequest: PullRequest): BotKitAttachment {
  return {
    title: `${pullRequest.repo}#${pullRequest.number}: ${pullRequest.title}`,
    title_link: pullRequest.url,
  }
}
