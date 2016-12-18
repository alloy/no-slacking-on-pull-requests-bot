# No Slacking on PRs!

![](resources/avatar.png)

This is a Slack bot that will keep track of open GitHub pull-requests assigned to registered users on your team.

## Usage

### Run locally

    $ npm install -g yarn
    $ yarn install
    $ env SLACK_TOKEN=<YOUR_SLACK_TOKEN> NODE_ENV=development yarn run dev

Things are looking good if the console prints something like:

    ** API CALL: https://slack.com/api/rtm.start
    ** BOT ID:  witty  ...attempting to connect to RTM!
    ** API CALL: https://slack.com/api/chat.postMessage

### Run locally in Docker

    $ docker build -t no-slacking-on-prs .
    $ docker run --rm -it -e SLACK_TOKEN=<YOUR SLACK API TOKEN> no-slacking-on-prs

_NOTE_: Because in this environment the BeepBoop key-value store is not available, nor write access to the file-system,
the users database will be an in-memory one.

If you need to inspect the built container, use the following command:

    $ docker run --rm -it --entrypoint=/bin/bash no-slacking-on-prs

## License

See the [LICENSE](LICENSE) file (MIT).

