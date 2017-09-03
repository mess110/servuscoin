var assert = require('assert');

var Address = require('../src/coin/Address');
var Block = require('../src/coin/Block');
var Blockchain = require('../src/coin/Blockchain');
var Constants = require('../src/utils/Constants');
var Miner = require('../src/coin/Miner');
var PoW = require('../src/coin/PoW');

describe('Blockchain', () => {
  it('has a genesis block', () => {
    var blockchain = new Blockchain();
    assert.equal(blockchain.size(), 1);

    var block = blockchain.getBlock(0);
    assert.equal(block.hash, '80acf69bb60b19115876dd2688aa64dd5ce88a2a73ebcf07511a899569cb2a1b');
    assert.equal(block.hash, block.toHash());
  });

  it('uses PoW', () => {
    var blockchain = new Blockchain();
    blockchain.difficulty = 1;
    var nextTimestamp = new Date().getTime();
    var lastBlock = blockchain.getLatestBlock();

    var newBlock = new Block(1, lastBlock.hash, nextTimestamp, 'hello');
    newBlock.hash = newBlock.toHash();
    newBlock.nonce = PoW.work(newBlock.hash, blockchain.difficulty);

    assert.equal(true, blockchain.isValidNewBlock(newBlock, lastBlock));

    // newBlock.nonce = newBlock.nonce + 'asd';
    // assert.equal(false, blockchain.isValidNewBlock(newBlock, lastBlock));
  });

  it('mines a block', () => {
    var blockchain = new Blockchain();
    blockchain.difficulty = 1;
    var miner = new Miner();
    miner.difficulty = 1;
    var newBlock = miner.mineFor(blockchain.getLatestBlock());
    blockchain.addNewBlock(newBlock);

    assert.equal(blockchain.size(), 2);
  });

  it('works', () => {
    var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');
    var blockchain = new Blockchain();
    blockchain.difficulty = 1;
    var miner = new Miner(address);
    miner.difficulty = 1;
    var newBlock = miner.mineFor(blockchain.getLatestBlock());
    blockchain.addNewBlock(newBlock);

    assert.equal(blockchain.getBalance(address.getServusKey()).balance, 1);
  });

  it('requires at least the correct difficulty',  () => {
    var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');
    var blockchain = new Blockchain();
    blockchain.difficulty = 2
    var miner = new Miner(address);
    miner.difficulty = 1;
    var newBlock = miner.mineFor(blockchain.getLatestBlock());
    blockchain.addNewBlock(newBlock);

    assert.equal(blockchain.size(), 1);
  });

  it('gets the time it took to mine a block', () => {
    var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');
    var miner = new Miner(address);
    var blockchain = new Blockchain();
    blockchain.difficulty = 2;
    miner.difficulty = blockchain.difficulty;
    var newBlock = miner.mineFor(blockchain.getLatestBlock());
    blockchain.addNewBlock(newBlock);

    newBlock = miner.mineFor(blockchain.getLatestBlock());
    blockchain.addNewBlock(newBlock);

    var mineTime = blockchain.getMineTime(newBlock.index);
    assert.equal(true, mineTime > 10); // ms
  });

  it('adjusts the difficulty every x blocks', () => {
    var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');

    var blockchain = new Blockchain();
    blockchain.difficulty = 1;
    blockchain.adjustBlockCount = 3;

    var miner = new Miner(address);

    for (var i = 0; i < 6; i++) {
      miner.difficulty = blockchain.difficulty;
      var newBlock = miner.mineFor(blockchain.getLatestBlock());
      blockchain.addNewBlock(newBlock);
    }

    assert.equal(blockchain.difficulty, 2)
  });

  it('gets the blockchain', () => {
    var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');

    var blockchain = new Blockchain();
    blockchain.difficulty = 1;
    blockchain.adjustBlockCount = 100;
    var miner = new Miner(address);
    for (var i = 0; i < 6; i++) {
      miner.difficulty = blockchain.difficulty;
      var newBlock = miner.mineFor(blockchain.getLatestBlock());
      blockchain.addNewBlock(newBlock);
    }

    assert.equal(blockchain.getBlockchain().length, 7)
    assert.equal(blockchain.getBlockchain(0).length, 7)
  });
});
