module.exports = class Hodler {
  constructor(blockchain, memPool) {
    this.blockchain = blockchain;
    this.memPool = memPool;
  }

  getHistory(callback) {
    callback(this.blockchain.getBlockchain());
  }

  getBalance(address, callback) {
    var balance = this.memPool.getBalance(address);
    balance.balance += this.blockchain.getBalance(address).balance;
    callback(balance);
  }
}
