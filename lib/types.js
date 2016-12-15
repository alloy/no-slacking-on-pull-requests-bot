// @flow

export type PullRequest = {
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
