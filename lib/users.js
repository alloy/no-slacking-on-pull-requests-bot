// @flow

import BeepBoopPersist from "beepboop-persist"
import type { User } from "./types"

const Users = {
  _storage: BeepBoopPersist(),

  set: function(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      Users._storage.set(user.slackHandle, user, (err) => err ? reject(err) : resolve())
    })
  },

  get: function(slackHandle: string): Promise<User> {
    return new Promise((resolve, reject) => {
      Users._storage.get(slackHandle, (err, user) => err ? reject(err) : resolve(user))
    })
  },

  all: function(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      Users._storage.list((err, slackHandles: string[]) => {
        err ? reject(err) : resolve(Promise.all(slackHandles.map(Users.get)))
      })
    })
  },
}

export default Users
