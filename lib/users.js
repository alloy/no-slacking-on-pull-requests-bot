// @flow

import BeepBoopPersist from "beepboop-persist"
import type { PullRequestID, SlackHandle, User } from "./types"

const { NODE_ENV } = process.env

const config = NODE_ENV === "development" ? { provider: "fs", directory: `${__dirname}/../tmp` } : {}

const Users = {
  _storage: BeepBoopPersist(config),

  set: function(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      Users._storage.set(user.slackHandle, user, (err) => err ? reject(err) : resolve())
    })
  },

  get: function(slackHandle: SlackHandle): Promise<User> {
    return new Promise((resolve, reject) => {
      Users._storage.get(slackHandle, (err, user) => err ? reject(err) : resolve(user))
    })
  },

  updateLastKnownPullRequests: function(user: User, pullRequestIDs: PullRequestID[]): Promise<void> {
    return Users.set(Object.assign({}, user, { lastKnownPullRequests: pullRequestIDs }))
  },

  all: function(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      Users._storage.list((err, slackHandles: SlackHandle[]) => {
        err ? reject(err) : resolve(Promise.all(slackHandles.map(Users.get)))
      })
    })
  },
}

export default Users
