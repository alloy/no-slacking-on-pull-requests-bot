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
      Users._storage.get(slackHandle, (err, user) => {
        if (err) {
          reject(err)
        } else if (user) {
          resolve(user)
        } else {
          const error: any = new Error("The requested user is not registered.")
          error.notRegistered = true
          reject(error)
        }
      })
    })
  },

  updateLastKnownPullRequestIDs: function(user: User, pullRequestIDs: PullRequestID[]): Promise<void> {
    return Users.set(Object.assign({}, user, { lastKnownPullRequestIDs: pullRequestIDs }))
  },

  remove: function(slackHandle: SlackHandle): Promise<void> {
    return new Promise((resolve, reject) => {
      Users._storage.del(slackHandle, (err) => err ? reject(err) : resolve())
    })
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
