// @flow

import type { BotKitAttachment, PullRequest } from "./types"

export default function formatPullRequest(pullRequest: PullRequest): BotKitAttachment {
  return {
    title: `${pullRequest.id}: ${pullRequest.title}`,
    title_link: pullRequest.url,
  }
}
