var Blockchain = require('../src/coin/Blockchain');

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
  }

  getBalance(address) {
    return super.getBalance(address);
  }
}
