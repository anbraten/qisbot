FROM node:12-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json yarn.lock /app/
RUN yarn --frozen-lockfile
COPY src /app/src/

VOLUME [ "/app/db" ]

CMD [ "yarn", "run", "start" ]
