var Constants = require('../utils/Constants');

module.exports = class MemPool {
  constructor() {
    this.transactions = [];
  }

  add(transaction) {
    this.transactions.push(transaction);
  }

  remove(transactions) {
    var compIds = transactions.map(function (x) {
      return x.hash;
    });
    this.transactions = this.transactions.filter(function (x) {
      return !compIds.includes(x.hash)
    })
  }

  clear() {
    this.transactions = [];
  }

  get() {
    return this.transactions;
  }

  getBalance(address) {
    var transactions = this.get();
    var balance = Constants.calcBalance(transactions);

    return { address: address, balance: balance };
  }
}
