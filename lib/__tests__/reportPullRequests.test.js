// @flow

import reportPullRequests from "../reportPullRequests"
import formatPullRequest from "../formatPullRequest"
import type { PullRequest, User } from "../types"

const pullRequests = []
let pullRequestsPromise = Promise.resolve(pullRequests)

jest.mock("../fetchPullRequests", () => {
  return jest.fn(() => pullRequestsPromise)
})

const alloy: User = {
  slackHandle: "U03HAB39U",
  githubHandle: "alloy",
  githubToken: "secret",
}

const pullRequest: PullRequest = {
  number: 42,
  title: "Make everything awesome",
  repo: "eigen",
  url: "https://example/pulls/42",
}

describe("reportPullRequests", () => {
  let convo, bot

  beforeEach(() => {
    convo = {
      say: jest.fn(),
    }

    bot = {
      startPrivateConversation: jest.fn((_, callback) => {
        callback(null, convo)
      }),
    }
  })

  it("uses the user’s slack handle to start a conversation", () => {
    return reportPullRequests(bot, alloy, false).then(() => {
      expect(bot.startPrivateConversation).toBeCalledWith({ user: alloy.slackHandle }, expect.any(Function))
    })
  })

  it("does not report that there are no pull requests, if not requested", () => {
    return reportPullRequests(bot, alloy, false).then(() => {
      expect(convo.say).not.toBeCalled()
    })
  })

  it("reports that there are no pull requests, if requested", () => {
    return reportPullRequests(bot, alloy, true).then(() => {
      expect(convo.say).toBeCalledWith("You have no open PRs. Great job!")
    })
  })

  it("reports formatted pull requests", () => {
    pullRequests.push(pullRequest)

    return reportPullRequests(bot, alloy, false).then(() => {
      expect(convo.say).toBeCalledWith({ attachments: [formatPullRequest(pullRequest)] })
    })
  })

  it("reports that an error occurred, if a response was requested", () => {
    pullRequestsPromise = Promise.reject(new Error("Oh Noes!"))
    return reportPullRequests(bot, alloy, true).then(() => {
      expect(convo.say).toBeCalledWith("Ah bugger, an error occurred: Oh Noes!")
    })
  })
})
