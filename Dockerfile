FROM node:lts-alpine

EXPOSE 8080

RUN apk add git

RUN echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
    && apk add --no-cache \
    chromium@edge \
    harfbuzz@edge \
    nss@edge \
    && rm -rf /var/cache/*

RUN git clone https://github.com/redhataccess/lighthoose.git /lighthoose

WORKDIR /lighthoose

RUN npm install

CMD ["npm", "start"]
