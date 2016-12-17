// @flow

import Users from "../users"
import type { User } from "../types"

describe("Users", () => {
  const alloy: User = {
    slackHandle: "U03HAB39U",
    githubHandle: "alloy",
    githubToken: "secret",
    lastKnownPullRequestIDs: [],
  }

  const orta: User = {
    slackHandle: "U03HAB39K",
    githubHandle: "orta",
    githubToken: "secret",
    lastKnownPullRequestIDs: [],
  }

  it("stores and retrieves a user", () => {
    return Users.set(alloy).then(() => {
      return Users.get(alloy.slackHandle).then(user => {
        expect(user).toEqual(alloy)
      })
    })
  })

  it("retrieves all users", () => {
    return Users.set(alloy).then(() => {
      return Users.set(orta).then(() => {
        return Users.all().then(users => {
          expect(users).toEqual([alloy, orta])
        })
      })
    })
  })

  it("updates the last known pull requests", () => {
    return Users.updateLastKnownPullRequestIDs(alloy, ["eigen#42"]).then(() => {
      expect(alloy.lastKnownPullRequestIDs).toEqual([])
      return Users.get(alloy.slackHandle).then(updatedUser => {
        expect(updatedUser.lastKnownPullRequestIDs).toEqual(["eigen#42"])
      })
    })
  })

  it("removes a user", () => {
    return Users.set(alloy).then(() => {
      return Users.remove(alloy.slackHandle).then(() => {
        return Users.get(alloy.slackHandle)
          .then(() => new Error("Expected to fail"))
          .catch(error => {
            expect(error.message).toContain("is not registered")
          })
      })
    })
  })
})
