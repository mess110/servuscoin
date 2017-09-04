var Blockchain = require('./Blockchain');
var DB = require('../utils/DB');

module.exports = class MongoChain extends Blockchain {
  constructor() {
    super();
    this.blocksInMemory = 500;
  }

  _push(block) {
    if (this.blockchain.length >= this.blocksInMemory) {
      this.blockchain.shift();
    }
    super._push(block);
    DB.insert(block);
  }

  getBalance(address) {
    return super.getBalance(address);
  }
}
