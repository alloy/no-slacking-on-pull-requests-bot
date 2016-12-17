// @flow

import Users from "../users"
import type { User } from "../types"

describe("Users", () => {
  const alloy: User = {
    slackHandle: "U03HAB39U",
    githubHandle: "alloy",
    githubToken: "secret",
  }

  const orta: User = {
    slackHandle: "U03HAB39K",
    githubHandle: "orta",
    githubToken: "secret",
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
})
