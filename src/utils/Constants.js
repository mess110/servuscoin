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
  miningReward: 1,
  manualDifficulty: false,
  minimumToSend: 0.01,

  difficulty: 1,
  decimals: decimals,

  OK: 0,

  BlockValidation: {
    PARAM_NEW_BLOCK_NOT_A_BLOCK: 1,
    PARAM_PREV_BLOCK_NOT_A_BLOCK: 2,
    INVALID_INDEX: 3,
    INVALID_PREV_HASH: 4,
    INVALID_HASH: 5,
    INVALID_NONCE: 6,
    INVALID_TRANSACTION_HASH: 7
  },

  TransactionValidation: {
    INVALID_SIGNATURE: 1,
    INVALID_REWARD: 2,
    SAME_ADDRESS_ERROR: 3,
    MISSING_ADDRESS: 4,
    INVALID_TYPE: 5,
    INVALID_INPUTS: 6,
    INVALID_AMOUNTS: 7,
    MINIMUM_SEND: 8,
    NUMBER_TOO_DIVIDED: 9,
  },

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
  },

  calcBalances: (blockchain) => {
    var allBalances = {}

    for (var block of blockchain.getBlockchain()) {
      for (var signedTransaction of block.data.transactions) {
        for (var transaction of signedTransaction.transactions) {
          if (allBalances[transaction.address] === undefined) {
            allBalances[transaction.address] = 0;
          }
          if (transaction.type == 'input') {
            allBalances[transaction.address] -= transaction.amount;
          }
          if (transaction.type == 'output') {
            allBalances[transaction.address] += transaction.amount;
          }
        }
      }
    }
    return allBalances;
  }
}

module.exports = hash;
