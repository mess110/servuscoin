var Block = require('./Block');
var Constants = require('../utils/Constants');
var PoW = require('./PoW');
var Transaction = require('./Transaction');

module.exports = class Miner {
  constructor(address) {
    this.address = address;
    this.difficulty = Constants.difficulty;
  }

  mineFor(block, memPoolT) {
    var nextTimestamp = new Date().getTime();
    var newBlock = new Block(block.index + 1, block.hash, nextTimestamp, { transactions: [] })

    if (this.address) {
      var transaction = new Transaction([
          { type: 'output', address: this.address.getServusKey(), amount: Constants.miningReward }
      ])
      transaction.sign(this.address.getPrivateKey());
      newBlock.addTransaction(transaction)
    }

    if (memPoolT) {
      for (let transaction of memPoolT) {
        newBlock.addTransaction(transaction);
      }
    }

    newBlock.data.difficulty = this.difficulty;
    newBlock.hash = newBlock.toHash();
    newBlock.nonce = PoW.work(newBlock.hash, this.difficulty);

    this.log(newBlock);

    return newBlock;
  }

  log(data) {
    // console.log(data);
  }
}
