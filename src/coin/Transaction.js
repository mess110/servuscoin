var Address = require('./Address');

module.exports = class Transaction {
  constructor(transactions) {
    this.hash = undefined;
    this.timestamp = new Date().getTime();
    this.transactions = transactions;
  }

  sign(privateKey) {
    if (!(privateKey instanceof Address)) {
      var address = new Address(privateKey);
    } else {
      var address = privateKey;
    }
    this.hash = address.sign(this.hashContent());
    return this.hash;
  }

  // This ensures only the owner can spend funds
  isValid() {
    var inputAddress = '1' + this.getInputAddress().substring(4);
    return Address.verify(this.hashContent(), inputAddress, this.hash);
  }

  hashContent() {
    return JSON.stringify(this.transactions) + this.timestamp;
  }

  getInputAddress() {
    for (var transaction of this.transactions) {
      if (transaction.type === 'input') {
        return transaction.address;
      }
    }
    return null;
  }

  getInputAmount() {
    for (var transaction of this.transactions) {
      if (transaction.type === 'input') {
        return transaction.amount;
      }
    }
    return null;
  }

  toObject() {
    return JSON.parse(JSON.stringify(this));
  }

  static fromObject(obj) {
    var transaction = new Transaction(obj.transactions);
    transaction.timestamp = obj.timestamp;
    transaction.hash = obj.hash;
    return transaction;
  }
}
