var Block = require('./Block');
var Constants = require('../utils/Constants');
var PoW = require('./PoW');

module.exports = class Blockchain {
  constructor() {
    this.difficulty = Constants.difficulty;
    this.blockchain = [Blockchain.getGenesisBlock()];
    this.adjustBlockCount = 5;
    this.targetBlockTime = 10; // seconds
  }

  push(block) {
    // TODO: write protection against adding non block items
    this.blockchain.push(block);
  }

  setBlockchain(newBlocks) {
    // TODO: write protection against adding non block items
    this.blockchain = newBlocks;
  }

  getBlockchain() {
    return this.blockchain;
  }

  getBlock(index) {
    return this.blockchain[index]
  }

  size() {
    return this.blockchain.length;
  }

  getLatestBlock() {
    return this.getBlock(this.size() - 1);
  }

  adjustDifficulty() {
    if ((this.size() - 1) % this.adjustBlockCount != 0) {
      return;
    }

    var average = 0;
    for (var i = 0; i < this.adjustBlockCount; i++) {
      var val = this.getMineTime(this.size() - 1 - i)
      average += val;
    }
    average /= this.adjustBlockCount;

    if (average > this.targetBlockTime * 1000) {
      this.difficulty -= 1;
    } else {
      this.difficulty += 1;
    }

    if (this.difficulty < 1) {
      this.difficulty = 1;
    }
  }

  getMineTime(i) {
    return this.getBlock(i).timestamp - this.getBlock(i - 1).timestamp;
  }

  addNewBlock(newBlock) {
    if (this.isValidNewBlock(newBlock, this.getLatestBlock())) {
      this.push(newBlock);
      this.adjustDifficulty();
      return true;
    }
    return false;
  }

  generateNextBlock(params) {
    var previousBlock = this.getLatestBlock();
    var newBlock = new Block(params.index, previousBlock.hash, params.timestamp,
      params.data);
    newBlock.hash = newBlock.toHash()
    newBlock.nonce = params.nonce;
    return newBlock;
  }

  isValidNewBlock(newBlock, previousBlock) {
    if (!(newBlock instanceof Block)) {
      console.log('newBlock not a block');
      return false;
    } else if (!(previousBlock instanceof Block)) {
      console.log('previousBlock not a block');
      return false;
    } else if (previousBlock.index + 1 !== newBlock.index) {
      console.log('invalid index');
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log('invalid previoushash');
      return false;
    } else if (newBlock.toHash() !== newBlock.hash) {
      console.log(typeof (newBlock.hash) + ' ' + typeof newBlock.toHash());
      console.log('invalid hash: ' + newBlock.toHash() + ' ' + newBlock.hash);
      return false;
    } else if (!PoW.verify(newBlock.hash, newBlock.nonce, this.difficulty)) {
      console.log('invalid nonce');
      return false;
    }
    return true;
  }

  // TODO This method does too much and maybe has a bad name considering what it does
  isValidChain(blockchainToValidate) {
    var genesis = Blockchain.getGenesisBlock();
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(genesis)) {
      return false;
    }
    var tempBlocks = [genesis];
    for (var i = 1; i < blockchainToValidate.length; i++) {
      var newBlock = Block.fromObj(blockchainToValidate[i]);
      if (this.isValidNewBlock(newBlock, tempBlocks[i - 1])) {
        tempBlocks.push(newBlock);
      } else {
        return false;
      }
    }
    return tempBlocks;
  }

  getBalance(address) {
    var balance = 0;

    var blocks = this.getBlockchain()
    for (var block of blocks) {
      balance += Constants.calcBalance(block.data.transactions, address);
    }
    return { address: address, balance: balance };
  }

  static getGenesisBlock() {
    var tmp = new Block(0, "0", 1504363937102, {
      transactions: [],
      meta: "are cineva linku catre pozele de la pontoneala?",
      realDifficulty: 1,
      difficulty: 1
    }, "80acf69bb60b19115876dd2688aa64dd5ce88a2a73ebcf07511a899569cb2a1b");
    tmp.nonce = '88d2fc022db4';
    return tmp;
  }
}
