var Hodler = require('../coin/Hodler');

module.exports = class MongoHodler extends Hodler {
  constructor(blockchain, memPool) {
    super(blockchain, memPool);
  }
}
