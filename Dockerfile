FROM node:12-alpine

WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn --prod --frozen-lockfile
COPY src /app/src/

VOLUME [ "/app/db" ]

CMD [ "yarn", "run", "start" ]
