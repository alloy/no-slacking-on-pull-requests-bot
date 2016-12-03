// @flow

import type { Payload, State } from "./types"

export default function processPayload(state: State, payload: Payload): void {
  const assignees = payload.pull_request.assignees.map(assignee => assignee.login)
  state[payload.pull_request.id] = { assignees }
}
