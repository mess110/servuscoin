var assert = require('assert');

var PoW = require('../src/coin/PoW');
var Constants = require('../src/utils/Constants');

describe('PoW', function() {
  it('roundtrip', function () {
    var nonce = PoW.work('hello', 1);
    assert.equal(true, PoW.verify('hello', nonce, 1));
  });
});
