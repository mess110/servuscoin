var Block = require('./Block');
var Transaction = require('./Transaction');
var Constants = require('../utils/Constants');
var PoW = require('./PoW');

module.exports = class Blockchain {
  constructor() {
    this.difficulty = Constants.difficulty;
    this.blockchain = [];
    this.adjustBlockCount = 5;
    this.targetBlockTime = 10; // seconds

    var tmp = new Block(0, "0", 1504363937102, {
      transactions: [],
      meta: "are cineva linku catre pozele de la pontoneala?",
      realDifficulty: 1,
      difficulty: 1
    }, "80acf69bb60b19115876dd2688aa64dd5ce88a2a73ebcf07511a899569cb2a1b");
    tmp.nonce = '88d2fc022db4';
    this._push(tmp);
  }

  _push(block) {
    this.blockchain.push(block);
  }

  setBlockchain(newBlocks) {
    for (var block of newBlocks) {
      if (this.getBlock(block.index) && this.getBlock(block.index).hash === block.hash) {
        // this also intentionally omits the genesis block because it can not
        // be validated with the previous block
        continue;
      }
      var result = this.addNewBlock(block, true);
      if (result === false) {
        console.log(block);
        throw 'could not add block';
      }
    }
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

  addNewBlock(newBlock, useBlockDifficulty) {
    var valid = this.isValidNewBlock(newBlock, this.getLatestBlock(), useBlockDifficulty);
    if (valid === Constants.OK) {
      this._push(newBlock);
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

  isValidNewBlock(newBlock, previousBlock, useBlockDifficulty = false) {
    if (!(newBlock instanceof Block)) {
      return Constants.BlockValidation.PARAM_NEW_BLOCK_NOT_A_BLOCK;
    } else if (!(previousBlock instanceof Block)) {
      return Constants.BlockValidation.PARAM_PREV_BLOCK_NOT_A_BLOCK;
    } else if (previousBlock.index + 1 !== newBlock.index) {
      return Constants.BlockValidation.INVALID_INDEX;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      return Constants.BlockValidation.INVALID_PREV_HASH;
    } else if (newBlock.toHash() !== newBlock.hash) {
      return Constants.BlockValidation.INVALID_HASH;
    } else if (!PoW.verify(newBlock.hash, newBlock.nonce, useBlockDifficulty ? newBlock.data.difficulty : this.difficulty)) {
      return Constants.BlockValidation.INVALID_NONCE;
    } else {
      for (var obj of newBlock.data.transactions) {
        var transaction = Transaction.fromObject(obj);
        if (transaction.isValid() !== Constants.OK) {
          return Constants.BlockValidation.INVALID_TRANSACTION_HASH;
        }
      }
    }
    return Constants.OK;
  }

  // TODO This method does too much and maybe has a bad name considering what it does
  isValidChain(blockchainToValidate) {
    var genesis = this.getGenesisBlock();
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(genesis)) {
      return false;
    }
    var tempBlocks = [genesis];
    for (var i = 1; i < blockchainToValidate.length; i++) {
      var newBlock = Block.fromObj(blockchainToValidate[i]);
      if (this.isValidNewBlock(newBlock, tempBlocks[i - 1]) === Constants.OK) {
        tempBlocks.push(newBlock);
      } else {
        return false;
      }
    }
    return tempBlocks;
  }

  getBalance(address) {
    var balance = 0;
    for (var block of this.getBlockchain()) {
      balance += Constants.calcBalance(block.data.transactions, address);
    }
    return { address: address, balance: balance };
  }

  getGenesisBlock() {
    return this.getBlockchain()[0];
  }
}
