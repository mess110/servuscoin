var createHash = require('crypto').createHash;
var n = require('nonce')();

module.exports = class PoW {
  static getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    //The maximum is inclusive and the minimum is inclusive 
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static work(input, difficulty = 1) {
    if (difficulty < 1) {
      throw 'difficulty too small';
    }

    // var id = 0;
    // var id = this.getRandomIntInclusive(0, 100000000000000000);
    var id = n();
    while (true) {
      var nonce = id.toString(16);
      if (PoW.verify(input, nonce, difficulty)) {
        return nonce;
      } else {
        id = n();
        // id++;
      }
    }
  }

  static hashify(input, nonce) {
    var sha256 = createHash('sha256');
    sha256.update(input);
    sha256.update(nonce);
    return sha256.digest('hex');
  }

  static verify(input, nonce, difficulty) {
    var hash = this.hashify(input, nonce);
    return hash.slice(-difficulty) === Array(difficulty + 1).join('0');
  }
}
