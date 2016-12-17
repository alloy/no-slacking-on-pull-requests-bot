// @flow

import fetchIssuesPage from "./fetchIssuesPage"
import type { GitHubToken, Issue, PullRequest } from "./types"

function extractPullRequests(issues: Issue[]): PullRequest[] {
  return issues.filter(issue => issue.pull_request).map(issue => {
    return {
      id: `${issue.repository.name}#${issue.number}`,
      number: issue.number,
      url: issue.html_url,
      title: issue.title,
      repo: issue.repository.name,
    }
  })
}

function _fetchPullRequests(token: GitHubToken, page: number, pullRequests: PullRequest[]): Promise<PullRequest[]> {
  return fetchIssuesPage(token, page)
    .catch((error) => console.log("ERROR: " + error))
    .then((response) => {
      pullRequests = pullRequests.concat(extractPullRequests(response.body))
      var link = response.header["link"]
      if (link && link.includes('rel="last"')) {
        return _fetchPullRequests(token, page + 1, pullRequests)
      } else {
        return pullRequests
      }
    })
}

export default function fetchPullRequests(token: GitHubToken): Promise<PullRequest[]> {
  return _fetchPullRequests(token, 1, [])
}
