var t = require('./TestHelper');

var Block = require('../src/coin/Block');
var Blockchain = require('../src/coin/Blockchain');
var Constants = require('../src/utils/Constants');
var Miner = require('../src/coin/Miner');
var PoW = require('../src/coin/PoW');
var Transaction = require('../src/coin/Transaction');

describe('Blockchain', () => {
  it('has a genesis block', () => {
    var blockchain = new Blockchain();
    t.assert.equal(blockchain.size(), 1);

    var block = blockchain.getBlock(0);
    t.assert.equal(block.hash, '80acf69bb60b19115876dd2688aa64dd5ce88a2a73ebcf07511a899569cb2a1b');
    t.assert.equal(block.hash, block.toHash());
  });

  it('works', () => {
    var address = t.address;

    var blockchain = new Blockchain();
    blockchain.difficulty = 1;

    var miner = new Miner(address);
    miner.difficulty = 1;

    var newBlock = miner.mineFor(blockchain.getLatestBlock());
    blockchain.addNewBlock(newBlock);

    t.assert.equal(blockchain.size(), 2);
    t.assert.equal(blockchain.getBalance(address.getServusKey()).balance, 1);
  });

  it('mines a block', () => {
    var blockchain = new Blockchain();
    blockchain.difficulty = 1;
    var miner = new Miner();
    miner.difficulty = 1;
    var newBlock = miner.mineFor(blockchain.getLatestBlock());
    blockchain.addNewBlock(newBlock);

    t.assert.equal(blockchain.size(), 2);
  });

  it('requires at least the correct difficulty',  () => {
    var address = t.address;
    var blockchain = new Blockchain();
    blockchain.difficulty = 2
    var miner = new Miner(address);
    miner.difficulty = 1;
    var newBlock = miner.mineFor(blockchain.getLatestBlock());
    blockchain.addNewBlock(newBlock);

    t.assert.equal(blockchain.size(), 1);
  });

  it('gets the time it took to mine a block', () => {
    var address = t.address;
    var miner = new Miner(address);
    var blockchain = new Blockchain();
    blockchain.difficulty = 3;
    miner.difficulty = blockchain.difficulty;
    var newBlock = miner.mineFor(blockchain.getLatestBlock());
    blockchain.addNewBlock(newBlock);

    newBlock = miner.mineFor(blockchain.getLatestBlock());
    blockchain.addNewBlock(newBlock);

    var mineTime = blockchain.getMineTime(newBlock.index);
    t.assert.equal(true, mineTime > 1); // ms
  });

  it('adjusts the difficulty every x blocks', () => {
    var address = t.address;

    var blockchain = new Blockchain();
    blockchain.difficulty = 1;
    blockchain.adjustBlockCount = 3;

    var miner = new Miner(address);

    for (var i = 0; i < 6; i++) {
      miner.difficulty = blockchain.difficulty;
      var newBlock = miner.mineFor(blockchain.getLatestBlock());
      blockchain.addNewBlock(newBlock);
    }

    t.assert.equal(blockchain.difficulty, 2)
  });

  it('gets the blockchain', () => {
    var address = t.address;

    var blockchain = new Blockchain();
    blockchain.difficulty = 1;
    blockchain.adjustBlockCount = 100;
    var miner = new Miner(address);
    for (var i = 0; i < 6; i++) {
      miner.difficulty = blockchain.difficulty;
      var newBlock = miner.mineFor(blockchain.getLatestBlock());
      blockchain.addNewBlock(newBlock);
    }

    t.assert.equal(blockchain.getBlockchain().length, 7)
    t.assert.equal(blockchain.getBlockchain(0).length, 7)
  });

  describe('isValidNewBlock()', () => {
    it('expects params to be blocks', () => {
      var blockchain = new Blockchain();

      var valid = blockchain.isValidNewBlock({}, blockchain.getGenesisBlock());
      t.assert.equal(valid, Constants.BlockValidation.PARAM_NEW_BLOCK_NOT_A_BLOCK);

      var valid = blockchain.isValidNewBlock(blockchain.getGenesisBlock(), {});
      t.assert.equal(valid, Constants.BlockValidation.PARAM_PREV_BLOCK_NOT_A_BLOCK);
    })

    it('expects the correct index', () => {
      var blockchain = new Blockchain();
      var valid = blockchain.isValidNewBlock(blockchain.getGenesisBlock(), blockchain.getGenesisBlock());
      t.assert.equal(valid, Constants.BlockValidation.INVALID_INDEX);
    });

    it('expects the correct prev hash', () => {
      var blockchain = new Blockchain();
      var block = new Block(1, 'not this one');
      var valid = blockchain.isValidNewBlock(block, blockchain.getGenesisBlock());
      t.assert.equal(valid, Constants.BlockValidation.INVALID_PREV_HASH);
    });

    it('expects the correct hash', () => {
      var blockchain = t.blockchain;
      var block = t.mine();

      var valid = blockchain.isValidNewBlock(block, blockchain.getGenesisBlock());
      t.assert.equal(valid, Constants.OK);

      block.hash = 'not this one';

      valid = blockchain.isValidNewBlock(block, blockchain.getGenesisBlock());
      t.assert.equal(valid, Constants.BlockValidation.INVALID_HASH);
    })

    it('verifies PoW', () => {
      var blockchain = t.blockchain;
      var block = t.mine(2);
      var lastBlock = blockchain.getLatestBlock();

      t.assert.equal(Constants.OK, blockchain.isValidNewBlock(block, lastBlock));

      block.nonce = block.nonce + 'asd';
      t.assert.equal(Constants.BlockValidation.INVALID_NONCE, blockchain.isValidNewBlock(block, lastBlock));
    });

    it('verifies the transaction hashes', () => {
      var blockchain = t.blockchain;
      var block = t.mine();

      var valid = blockchain.isValidNewBlock(block, blockchain.getGenesisBlock());
      t.assert.equal(Constants.OK, valid);

      block.data.transactions[0].hash = 'a' + block.data.transactions[0].hash.slice(1);
      block.hash = block.toHash()
      block.nonce = PoW.work(block.hash, blockchain.difficulty);

      t.assert.equal(Constants.BlockValidation.INVALID_TRANSACTION_HASH, blockchain.isValidNewBlock(block, blockchain.getGenesisBlock()));
    })
  });
});
