var assert = require('assert');

var MemPool = require('../src/coin/MemPool');
var Address = require('../src/coin/Address');
var Transaction = require('../src/coin/Transaction');

describe('MemPool', function() {
  it('correctly gets the balance', function () {
    var address = new Address('L3MjaUBomjmPLjm8REPgmbBPB6aYQtMK8TMr71PhDuK6GHymHqAB')
    var amount = 10;
    var transaction = new Transaction([
      { type: 'input', address: address.getServusKey(), amount: amount },
      { type: 'output', address: 'destination', amount: amount }
    ]);

    var memPool = new MemPool();
    memPool.add(transaction.toObject);

    var key = address.getServusKey();

    console.log(memPool.getBalance(key));
  });
});
