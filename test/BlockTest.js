var assert = require('assert');

var Block = require('../src/coin/Block');

describe('Block', function() {
  it('converts toHash', function () {
    var block = new Block(1, 'prev', 1504051321.583, {})
    assert.equal(block.toHash(), 'ec5473f60f182e7034c4c77ec8e57e9fe40c854352490bef6221bddf58c78c28');
  });
});
