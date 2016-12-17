// @flow

import request from "superagent"
import type { GitHubToken, IssuesResponse } from "./types"

export default function fetchIssuesPage(token: GitHubToken, page: number): Promise<IssuesResponse> {
  return request
    .get("https://api.github.com/orgs/artsy/issues")
    .query({ state: "open", filter: "assigned", page: page })
    .set("Authorization", "token " + token)
    .accept("json")
}
