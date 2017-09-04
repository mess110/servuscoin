var assert = require('assert');

var Address = require('../src/coin/Address');
var Blockchain = require('../src/coin/Blockchain');
var MemPool = require('../src/coin/MemPool');
var Miner = require('../src/coin/Miner');
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
    memPool.add(transaction.toObject());

    var key = address.getServusKey();
    assert.equal(memPool.getBalance(key).balance, -10);
  });

  it('has the transactions from block', () => {
    var address = new Address('L3MjaUBomjmPLjm8REPgmbBPB6aYQtMK8TMr71PhDuK6GHymHqAB')
    var memPool = new MemPool();
    var amount = 10;

    var transaction = new Transaction([
      { type: 'input', address: address.getServusKey(), amount: amount },
      { type: 'output', address: 'destination', amount: amount }
    ]);
    transaction.sign(address);

    var miner = new Miner(address);
    miner.difficulty = 1;

    var blockchain = new Blockchain();
    var block = miner.mineFor(blockchain.getLatestBlock(), [transaction]);

    assert.equal(false, memPool.hasTransactions(block.data.transactions));

    memPool.add(transaction.toObject());
    assert.equal(true, memPool.hasTransactions(block.data.transactions));
  });
});
