var assert = require('assert');

var Address = require('../src/coin/Address');

describe('Address', function() {
  it('roundtrips', function () {
    var key = new Address();

    var publicKey = '1MVAGUNEEoEpJBsBVEcPYq6th4RTz4cw9C';
    var wif = 'L3MjaUBomjmPLjm8REPgmbBPB6aYQtMK8TMr71PhDuK6GHymHqAB';

    key = new Address(wif);
    assert.equal(key.getPublicKey(), publicKey);
    assert.equal(key.getPrivateKey(), wif);

    var signature = key.sign('hello');
    assert.equal(signature, 'IPCchKPMAn2bLVnpjJD81FsoM52wr59WdS29kZ7DijklPPbGYD55N6rJLWVPcCvudKKHXgS+l+l6uFeFPoGQhKI=');

    var owned = key.verify('hello', signature);
    assert.equal(owned, true);

    var owned = Address.verify('hello', key.getPublicKey(), signature);
    assert.equal(owned, true);

    var servus = key.getServusKey();
  });
});
