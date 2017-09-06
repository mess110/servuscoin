const WebSocket = require("ws");
const Const = require('./Constants');
const MessageType = Const.MessageType;

module.exports = class P2P {
  constructor(p2pPort, hodler) {
    this.sockets = [];
    this.blockchain = hodler.blockchain;
    this.memPool = hodler.memPool;

    var server = new WebSocket.Server({port: p2pPort});
    server.on('connection', ws => this.initConnection(ws));
    console.log('listening websocket p2p port on: ' + p2pPort);
  }

  initConnection(ws) {
    this.sockets.push(ws);
    this.initMessageHandler(ws);
    this.initErrorHandler(ws);
    this.write(ws, this.queryChainLengthMsg());
  }

  write(ws, message) {
    ws.send(JSON.stringify(message));
  }

  broadcast(message) {
    this.sockets.forEach(socket => this.write(socket, message));
  }

  initMessageHandler(ws) {
    ws.on('message', (data) => {
        var message = JSON.parse(data);
        // console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                this.write(ws, this.responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                this.write(ws, this.responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                this.handleBlockchainResponse(message);
                break;
        }
    });
  }

  handleBlockchainResponse(message) {
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = this.blockchain.getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("We can append the received block to our chain");
            this.blockchain._push(latestBlockReceived);
            this.broadcast(this.responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            this.broadcast(this.queryAllMsg());
        } else {
            console.log("Received blockchain is longer than current blockchain");
            this.replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
  }

  initErrorHandler(ws) {
    var closeConnection = (ws) => {
        console.log('connection failed to peer: ' + ws.url);
        this.sockets.splice(this.sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
  }

  connectToPeers(newPeers) {
    newPeers.forEach((peer) => {
        var ws = new WebSocket(peer);
        ws.on('open', () => this.initConnection(ws));
        ws.on('error', () => {
            console.log('connection failed')
        });
    });
  }

  replaceChain(newBlocks) {
    var tempBlocks = this.blockchain.isValidChain(newBlocks);
    if (tempBlocks !== false && newBlocks.length > this.blockchain.size()) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        this.blockchain.setBlockchain(tempBlocks);
        this.broadcast(this.responseLatestMsg());
    } else {
        console.log('Received blockchain invalid');
    }
  }

  queryChainLengthMsg() {
    return {'type': MessageType.QUERY_LATEST};
  }

  responseLatestMsg() {
    return {
      'type': MessageType.RESPONSE_BLOCKCHAIN,
      'data': JSON.stringify([this.blockchain.getLatestBlock()])
    };
  }

  responseChainMsg() {
    return {
      'type': MessageType.RESPONSE_BLOCKCHAIN,
      'data': JSON.stringify(this.blockchain.getBlockchain())
    }
  }

  queryAllMsg() {
    return {
      'type': MessageType.QUERY_ALL
    };
  }
}
