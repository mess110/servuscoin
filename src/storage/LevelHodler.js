var levelup = require('levelup');

var Constants = require('../utils/Constants');
var Hodler = require('../coin/Hodler');

module.exports = class LevelHodler extends Hodler {
  constructor(blockchain, memPool) {
    super(blockchain, memPool);
    this.db = levelup(Constants.db.path, { valueEncoding: 'json' });
    this.blockchain.db = this.db;
    this.blockchain.dbPut(this.blockchain.getGenesisBlock());
  }

  getHistory(callback) {
    var readStream = this.db.createValueStream();
    var blocks = [];
    readStream.on('data', function (block) {
      blocks.push(block);
    }).on('end', function () {
      callback(blocks);
    });
  }

  getBalance(address, callback) {
    var allData = [];
    var blocks = [];
    var readStream = this.db.createValueStream();
    readStream.on('data', function (block) {
      blocks.push(block);
      for (var transaction of block.data.transactions) {
        allData.push(transaction);
      }
    }).on('error', function (err) {
      console.log('getBalance error:', err);
    }).on('end', function () {
      var output = {
        address: address,
        balance: Constants.calcBalance(allData, address)
      }
      callback(output);
    });
  }
}
