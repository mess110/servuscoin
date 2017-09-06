'use strict';

var fs = require('fs');

// var Blockchain = require('./coin/Blockchain');
var Blockchain = require('./storage/LevelChain');
var Constants = require('./utils/Constants');
// var Hodler = require('./coin/Hodler');
var Hodler = require('./storage/LevelHodler');
var HttpServer = require('./utils/HttpServer');
var MemPool = require('./coin/MemPool');
var P2P = require('./utils/P2P');

var init = () => {
  var httpPort = process.env.HTTP_PORT || 3001;
  var p2pPort = process.env.P2P_PORT || 6001;
  var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

  var blockchain = new Blockchain();
  var memPool = new MemPool();
  var hodler = new Hodler(blockchain, memPool);

  var backupPath = './public/blocks.json';
  if (fs.existsSync(backupPath)) {
    console.log('loading blockchain from disk');
    var json = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    var tempBlocks = blockchain.isValidChain(json);
    console.log("Loading " + tempBlocks.length + " blocks");
    blockchain.setBlockchain(tempBlocks);
  }
  blockchain.difficulty = 4;

  var p2p = new P2P(p2pPort, hodler);
  var httpServer = new HttpServer(httpPort, p2p, hodler);
  // p2p.connectToPeers(initialPeers);

  // console.log(Constants.calcBalances(blockchain.getBlockchain()));
}

init()
