FROM node:15

WORKDIR /app

COPY package.json .

RUN npm i

ARG NODE_ENV

RUN if [ "$NODE_ENV" = "development" ]; \
    then npm i; \
    else npm i --only=prod; \
    fi

COPY . .

ENV PORT 4000

EXPOSE $PORT

CMD ["node", "index.js"]