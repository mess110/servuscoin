var bitcoin = require('bitcoinjs-lib');
var bitcoinMessage = require('bitcoinjs-message');

const messagePrefix = 'ServusCoin Signed Message:';

module.exports = class Address {
  constructor(wif) {
    if (wif === undefined) {
      this.key = bitcoin.ECPair.makeRandom()
    } else {
      this.key = bitcoin.ECPair.fromWIF(wif);
    }
  }

  getPublicKey() {
    return this.key.getAddress();
  }

  getPrivateKey() {
    return this.key.toWIF();
  }

  getServusKey() {
    return 'caca' + this.getPublicKey().substring(1);
  }

  sign(message) {
    var privateKey = this.key.d.toBuffer(32);
    var signature = bitcoinMessage.sign(message, messagePrefix, privateKey, this.key.compressed)
    return signature.toString('base64');
  }

  verify(message, signature) {
    return Address.verify(message, this.getPublicKey(), signature);
  }

  static verify(message, address, signature) {
    try {
      return bitcoinMessage.verify(message, messagePrefix, address, signature);
    } catch (e) {
      return false;
    }
  }
}
