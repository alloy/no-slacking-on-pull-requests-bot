// @flow

import processPayload from "../processPayload"
import type { Payload, State } from "../types"

describe("processPayload", () => {
  let state: State

  beforeEach(() => {
    state = { pullRequests: {} }
  })

  it("adds a PR to the known PRs", () => {
    const payload: Payload = {
      pull_request: {
        id: 42,
        assignees: [{ login: "alloy" }],
      },
    }
    processPayload(state, payload)
    expect(state[42]).toEqual({ assignees: ["alloy"] })
  })
})
