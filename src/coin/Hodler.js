module.exports = class Hodler {
  constructor(blockchain, memPool) {
    this.blockchain = blockchain;
    this.memPool = memPool;
  }

  getBalance(address, callback) {
    var balance = this.blockchain.getBalance(address);
    balance.balance += this.memPool.getBalance(address).balance;
    callback(balance);
  }
}
