// @flow

import formatPullRequest from "../formatPullRequest"
import type { PullRequest } from "../types"

describe("formatPullRequest", () => {
  it("renders a BotKit attachment", () => {
    const pullRequest: PullRequest = {
      number: 42,
      title: "Make everything awesome",
      repo: "eigen",
      url: "https://example/pulls/42",
    }

    expect(formatPullRequest(pullRequest)).toEqual({
      title: "eigen#42: Make everything awesome",
      title_link: "https://example/pulls/42",
    })
  })
})
