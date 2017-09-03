FROM node:4.6

RUN mkdir /servuscoin
ADD . /servuscoin/

RUN cd /servuscoin && npm install

EXPOSE 3001
EXPOSE 6001

ENTRYPOINT cd /servuscoin && npm install && PEERS=$PEERS npm start
