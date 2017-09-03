var package = require('../../package.json');

var isNode = false;
if (typeof process === 'object') {
  if (typeof process.versions === 'object') {
    if (typeof process.versions.node !== 'undefined') {
      isNode = true;
    }
  }
}

var decimals = 2;

var hash = {
  url: 'https://95.85.63.206:3001/',
  // url: 'https://localhost:3001/',
  isNode: isNode,
  version: package.version,

  difficulty: 1,
  decimals: decimals,

  MessageType: {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
  },

  calcBalance: function (inputs, address) {
    var balance = 0;
    for (var signedTransaction of inputs) {
      for (var transaction of signedTransaction.transactions) {
        if (address === transaction.address) {
          if (transaction.type === 'input') {
            balance -= transaction.amount;
          }
          if (transaction.type === 'output') {
            balance += transaction.amount;
          }

          balance = Number((balance).toFixed(decimals));
        }
      }
    }
    return balance;
  }
}

module.exports = hash;
