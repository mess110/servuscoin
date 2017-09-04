var Address = require('./Address');
var Constants = require('../utils/Constants');

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

  isValid() {
    var isMinigTransaction = this.transactions.length === 1 && this.transactions[0].type === 'output';

    for (var transaction of this.transactions) {
      if (transaction.type !== 'input' && transaction.type !== 'output') {
        return Constants.TransactionValidation.INVALID_TYPE;
      }
    }

    if (isMinigTransaction === true) {
      if (this.transactions[0].amount != Constants.miningReward) {
        return Constants.TransactionValidation.INVALID_REWARD;
      }
    } else {
      if (this.getAddress('input') === this.getAddress('output')) {
        return Constants.TransactionValidation.SAME_ADDRESS_ERROR;
      }

      if (this.transactions.length != 2) {
        return Constants.TransactionValidation.INVALID_INPUTS;
      }

      if (this.getAmount('input') !== this.getAmount('output')) {
        return Constants.TransactionValidation.INVALID_AMOUNTS;
      }
    }

    var tmpAddress = this.getAddress('input');
    if (tmpAddress === null && isMinigTransaction) {
      tmpAddress = this.getAddress('output');
    }

    // Show the code early to friends, yes that seems like a good idea.
    //
    // Felix sent a really small transaction before I implemented minimum send
    // and fragmentation validation. This means this transaction can't validate
    // with the current rules. So we skip it.
    //
    // This approach, while ugly, provides flexibility: if smaller divisions will
    // be possible in the future, this doesn't stop that.
    //
    // Thanks, I guess. Would have been extermly helpful if I didn't tell him
    // beforehand validation is missing.
    //
    // At least now we know his key.
    //
    if (this.hash !== 'H4t4K33U9Hf4wWlOXzT/7810+4Mbh61dNqUq1A8C5UiETvrvkLcRN2MmW6rHikAXqoRg6bSsP1XdtBXWWEXFwAo=') {
      if (this.getAmount('output') < 0.01) {
        return Constants.TransactionValidation.MINIMUM_SEND;
      }

      if (Number((this.getAmount('output')).toFixed(Constants.decimals)) !== this.getAmount('output')) {
        return Constants.TransactionValidation.NUMBER_TOO_DIVIDED;
      }
    }

    if (tmpAddress === null || tmpAddress === undefined) {
      return Constants.TransactionValidation.MISSING_ADDRESS;
    }

    var address = '1' + tmpAddress.substring(4);
    var hashContent = this.hashContent();

    if (Address.verify(hashContent, address, this.hash)) {
      return Constants.OK;
    } else {
      return Constants.TransactionValidation.INVALID_SIGNATURE;
    }
  }

  hashContent() {
    return JSON.stringify(this.transactions) + this.timestamp;
  }

  getAddress(type) {
    for (var transaction of this.transactions) {
      if (transaction.type === type) {
        return transaction.address;
      }
    }
    return null;
  }

  getAmount(type) {
    for (var transaction of this.transactions) {
      if (transaction.type === type) {
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
