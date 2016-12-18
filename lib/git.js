// @flow

import { spawnSync } from "child_process"

export function git(command: string[]): string {
  const { stdout } = spawnSync("git", command, { encoding: "utf-8" })
  const output: string = (stdout: any)
  return output.trim()
}

const GIT_VERSION = git(["rev-parse", "HEAD"])
const GITHUB_REPO = git(["config", "--get", "remote.origin.url"])
                      .replace("git@", "https://")
                      .replace("github.com:", "github.com/")
                      .replace(".git", "")

export const COMMIT_LINK = `${GITHUB_REPO}/tree/${GIT_VERSION}`
