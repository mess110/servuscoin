'use strict';

var fs = require('fs');

var Blockchain = require('./storage/LevelChain');
var Constants = require('./utils/Constants');
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

  hodler.getHistory((blocks) => {
    var tempBlocks = blockchain.isValidChain(blocks);
    if (tempBlocks === false) {
      console.log('Could not load blockchain from disk');
      return;
    }

    console.log("Loading " + tempBlocks.length + " blocks");
    blockchain.setBlockchain(tempBlocks);

    blockchain.difficulty = blockchain.getLatestBlock().data.difficulty;

    console.log(Constants.calcBalances(blocks));
  });


  var p2p = new P2P(p2pPort, hodler);
  var httpServer = new HttpServer(httpPort, p2p, hodler);
  // p2p.connectToPeers(initialPeers);
}

init()
