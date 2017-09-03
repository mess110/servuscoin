var CryptoJS = require("crypto-js");

module.exports = class Block {
  constructor(index, previousHash, timestamp, data, hash) {
    this.index = index;
    this.previousHash = previousHash.toString();
    this.timestamp = timestamp;
    this.data = data;
    if (hash !== undefined) {
      this.hash = hash.toString();
    }
  }

  addTransaction(transaction) {
    this.data.transactions.push(transaction);
  }

  addRawTransaction(type, address, amount) {
    this.data.transactions.push({
      type: type,
      address: address,
      amount: parseFloat(amount)
    });
  }

  toHash() {
    return CryptoJS.SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
  }

  toObject() {
    return JSON.parse(JSON.stringify(this));
  }

  static fromObj(obj) {
    var block = new Block(obj.index, obj.previousHash, obj.timestamp, obj.data, obj.hash);
    block.nonce = obj.nonce;
    return block;
  }
}
