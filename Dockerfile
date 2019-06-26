FROM node:lts-alpine

EXPOSE 8080

RUN apk add git

RUN echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
    && apk add --no-cache \
    chromium@edge \
    harfbuzz@edge \
    nss@edge \
    freetype@edge \
    && rm -rf /var/cache/*

RUN mkdir /lighthoose
WORKDIR /lighthoose

COPY . /lighthoose

RUN npm install

CMD ["npm", "start"]
