// @flow

export type PullRequestID = string

export type PullRequest = {
  id: PullRequestID,
  number: number,
  url: string,
  title: string,
  repo: string,
}

export type Issue = {
  number: number,
  html_url: string,
  title: string,
  repository: {
    name: string,
  },
  pull_request?: {},
}

export type IssuesResponse = {
  header: {
    link?: string
  },
  body: Issue[]
}

export type SlackHandle = string
export type GitHubHandle = string
export type GitHubToken = string

export type User = {
  slackHandle: SlackHandle,
  githubHandle: GitHubHandle,
  githubToken: GitHubToken,
}

export type BotKitAttachment = {
  title: string,
  title_link: string,
}
