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

RUN useradd -m lighthoose
RUN usermod -a -G 0 lighthoose

RUN mkdir /lighthoose
WORKDIR /lighthoose
COPY . /lighthoose

RUN chgrp -R 0 /lighthoose
RUN chmod -R g+rwx /lighthoose

USER lighthoose
RUN npm install

CMD ["npm", "start"]
