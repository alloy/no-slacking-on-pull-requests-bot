// @flow

import BeepBoopPersist from "beepboop-persist"
import type { SlackHandle, User } from "./types"

const { NODE_ENV } = process.env

const Users = {
  _storage: BeepBoopPersist({ provider: NODE_ENV === "development" ? "fs" : null }),

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

  all: function(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      Users._storage.list((err, slackHandles: SlackHandle[]) => {
        err ? reject(err) : resolve(Promise.all(slackHandles.map(Users.get)))
      })
    })
  },
}

export default Users
