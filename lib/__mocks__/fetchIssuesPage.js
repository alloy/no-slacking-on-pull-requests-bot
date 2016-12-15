// @flow

import type { IssuesResponse } from "../types"

let MockResponses: IssuesResponse[]

export default function fetchIssuesPage(token: string, page: number): Promise<IssuesResponse> {
  return Promise.resolve(MockResponses.shift())
}

fetchIssuesPage.setMockResponses = (responses) => {
  MockResponses = responses
}
