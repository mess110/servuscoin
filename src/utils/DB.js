var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var Constants = require('./Constants');

module.exports = class DB {
  static getAll(callback) {
    MongoClient.connect(Constants.db, function(err, db) {
      assert.equal(null, err);

      var collection = db.collection('blocks');
      collection.find({}).sort({index: 1}).toArray((err, docs) => {
        assert.equal(err, null);
        callback(docs);
        db.close();
      });
    });
  }

  static insert(block) {
    MongoClient.connect(Constants.db, function(err, db) {
      assert.equal(null, err);

      var collection = db.collection('blocks');

      collection.find({ _id: block.hash }).toArray(function(err, docs) {
        assert.equal(err, null);
        if (docs.length == 0) {
          block._id = block.hash;
          collection.insert(block, function (err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
          });
        } else {
          // console.log(docs[0].index);
        }
        // db.close();
      });
    });
  }

  // TODO: this is the lazy way. need a better one in which
  // we don't load all the data.
  //
  // one option would be to cache address amount at a certain block
  static getBalance(address, memPool, callback) {
    this.getAll((inputs) => {
      var balance = Constants.calcBalances(inputs)[address];
      balance += memPool.getBalance(address).balance;
      callback(balance);
    });
  }
}
