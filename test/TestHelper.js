var Address = require('../src/coin/Address');
var Blockchain = require('../src/coin/Blockchain');
var Miner = require('../src/coin/Miner');

var address = new Address('L3MjaUBomjmPLjm8REPgmbBPB6aYQtMK8TMr71PhDuK6GHymHqAB');
var address2 = new Address('KzBWsH29tFNNiggQor7fKyUKYX8fC59bYeMjYXSZ4pTg9h2bHrPG');

module.exports = {
  assert: require('assert'),

  address: address,
  address2: address2,

  blockchain: new Blockchain(),

  mine: (difficulty = 1) => {
    var blockchain = new Blockchain();
    blockchain.difficulty = difficulty;

    var miner = new Miner(address);
    miner.difficulty = difficulty;

    return miner.mineFor(blockchain.getLatestBlock())
  }
}
