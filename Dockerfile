FROM node:7.2.1

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/
RUN npm install yarn -g
RUN yarn install
COPY . /usr/src/app
RUN yarn run build

CMD [ "yarn", "start" ]