# ServusCoin

Every time there was a decision to take, I took the one which took least time to
implement.

At the moment there is an infinte supply of ServusCoins, this might change once
all security and scaling considerations are taken into account

## Roadmap

### Scaling

* Persist blockchain
* Announce transactions

### Security

* Take care of longest chain possible hijack (not sure)

### Nice to have

* import key
* Select pool (default hardcoded)
* Setup WebRTC wallet
 * Credits
 * Documentation

## Quick start

```
npm install
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
HTTP_PORT=3001 P2P_PORT=6001 npm start
HTTP_PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 npm start
MINE_ADDRESS=private_key HTTP_BASE_URL=http://localhost:3001/ npm run mine
```

### Quick start with Docker

```sh
docker-compose up
HTTP_BASE_URL=http://localhost:3001/ npm run mine
```

## HTTP API

### Get blockchain

```
curl http://localhost:3001/blocks
```

### Add peer

```
curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:6001"}' http://localhost:3001/peer
```

### Query connected peers

```
curl http://localhost:3001/peers
```
