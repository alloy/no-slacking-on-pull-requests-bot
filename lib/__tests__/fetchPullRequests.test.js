// @flow

jest.mock("../fetchIssuesPage")
const fetchIssuesPageMock: any = require("../fetchIssuesPage").default

import fetchPullRequests from "../fetchPullRequests"
import type { Issue, IssuesResponse } from "../types"

function generateIssue(number: number, isPullRequest: boolean = false): Issue {
  return {
    number,
    html_url: `https://github.com/artsy/eigen/issues/${number}`,
    title: `Issue ${number}`,
    repository: {
      name: "eigen",
    },
    pull_request: isPullRequest ? {} : undefined,
  }
}

function generatePullRequest(number: number): Issue {
  return generateIssue(number, true)
}

describe("fetchPullRequests", () => {
  it("only extracts PR issues", () => {
    const responses: IssuesResponse[] = [
      {
        header: {},
        body: [
          generateIssue(1),
          generatePullRequest(2),
          generateIssue(3),
        ],
      },
    ]
    fetchIssuesPageMock.setMockResponses(responses)

    return fetchPullRequests("token").then(pullRequests => {
      expect(pullRequests.map(({ number }) => number)).toEqual([2])
    })
  })

  it("fetches all pages of issues and sorts by ID", () => {
    const pageURL = n => `https://api.github.com/organizations/546231/issues?state=open&filter=assigned&page=${n}>`

    const responses: IssuesResponse[] = [
      {
        header: {
          link: `<${pageURL(2)}>; rel="next", <${pageURL(3)}>; rel="last"`,
        },
        body: [
          generatePullRequest(2),
        ],
      },
      {
        header: {
          link: `<${pageURL(3)}>; rel="next", <${pageURL(3)}>; rel="last"`,
        },
        body: [
          generatePullRequest(3),
        ],
      },
      {
        header: {
          link: `<${pageURL(1)}>; rel="first", <${pageURL(2)}>; rel="prev"`,
        },
        body: [
          generatePullRequest(1),
        ],
      },
    ]
    fetchIssuesPageMock.setMockResponses(responses)

    return fetchPullRequests("token").then((pullRequests) => {
      expect(pullRequests.map(({ number }) => number)).toEqual([1, 2, 3])
    })
  })
})
