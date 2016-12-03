// @flow

export type Payload = {
  // action: string,
  pull_request: {
    id: number,
    assignees: { login: string }[],
  }
}

export type PullRequest = {

}

export type State = {
  pullRequests: { [key: number]: PullRequest },
}
