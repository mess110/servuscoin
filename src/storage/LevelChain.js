var Blockchain = require('../coin/Blockchain');
var Constants = require('../utils/Constants');

module.exports = class LevelChain extends Blockchain {
  constructor() {
    super();
    this.blocksInMemory = 100;
  }

  _push(block) {
    if (this.blockchain.length >= this.blocksInMemory) {
      this.blockchain.shift();
    }
    super._push(block);
    this.dbPut(block);
  }

  dbPut(block) {
    this.db.put(block.index, block, (err, value) => {
      if (err) return console.log('dbPut error:', err);
    });
  }
}
