'use strict';

var fs = require('fs');

var Blockchain = require('./coin/Blockchain');
var HttpServer = require('./utils/HttpServer');
var MemPool = require('./coin/MemPool');
var P2P = require('./utils/P2P');

var httpPort = process.env.HTTP_PORT || 3001;
var p2pPort = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

var blockchain = new Blockchain();

var backupPath = './public/blocks.json';
if (fs.existsSync(backupPath)) {
  console.log('loading blockchain from disk');
  var json = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  var tempBlocks = blockchain.isValidChain(json);
  blockchain.setBlockchain(tempBlocks);
}
blockchain.difficulty = 4;

var memPool = new MemPool();
var p2p = P2P.initP2PServer(p2pPort, blockchain);
var httpServer = HttpServer.initHttpServer(httpPort, p2p, blockchain, memPool);
p2p.connectToPeers(initialPeers);
