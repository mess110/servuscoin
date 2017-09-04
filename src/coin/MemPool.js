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
    this.transactions = this.get().filter(function (x) {
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
    var balance = Constants.calcBalance(this.get(), address);
    return { address: address, balance: balance };
  }

  hasTransactions(transactions) {
    var compIds = transactions.filter(function (x) {
      return x.transactions.length != 1;
    }).map(function (x) {
      return x.hash;
    });
    var foundTransactions = this.get().filter(function (x) {
      return compIds.includes(x.hash)
    })
    return foundTransactions.length == compIds.length;
  }
}
