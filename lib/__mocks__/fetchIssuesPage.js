// @flow

import type { GitHubToken, IssuesResponse } from "../types"

let MockResponses: IssuesResponse[]

export default function fetchIssuesPage(token: GitHubToken, page: number): Promise<IssuesResponse> {
  return Promise.resolve(MockResponses.shift())
}

fetchIssuesPage.setMockResponses = (responses) => {
  MockResponses = responses
}
