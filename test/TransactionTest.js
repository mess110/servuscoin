var assert = require('assert');

var Transaction = require('../src/coin/Transaction');
var Address = require('../src/coin/Address');

describe('Transaction', function() {
  it('returns the input address', function () {
    var address = new Address('L3MjaUBomjmPLjm8REPgmbBPB6aYQtMK8TMr71PhDuK6GHymHqAB')
    var amount = 10;
    var transaction = new Transaction([
      { type: 'input', address: address.getServusKey(), amount: amount },
      { type: 'output', address: 'destination', amount: amount }
    ]);
    assert.equal(address.getServusKey(), transaction.getInputAddress());
  });

  it('is valid for correctly signed inputs', function () {
    var address = new Address('L3MjaUBomjmPLjm8REPgmbBPB6aYQtMK8TMr71PhDuK6GHymHqAB')
    var address2 = new Address('KzBWsH29tFNNiggQor7fKyUKYX8fC59bYeMjYXSZ4pTg9h2bHrPG')

    var amount = 10;
    var transaction = new Transaction([
      { type: 'input', address: address.getServusKey(), amount: amount },
      { type: 'output', address: 'destination', amount: amount }
    ]);
    transaction.sign(address.getPrivateKey());
    assert.equal(true, transaction.isValid());

    transaction.sign(address2.getPrivateKey());
    assert.equal(false, transaction.isValid());
  });

  it('can sign messages', function () {
    var validSignature = 'H+A3fD3J1Df7vvPSVFrsGQAq4j3EYW547CzJXD30H2MRfNiQ6R1WPh2P2bXg8uJ4ufPVZ+1zzr+zXPiZW+Ugays=';
    var address = new Address('L3MjaUBomjmPLjm8REPgmbBPB6aYQtMK8TMr71PhDuK6GHymHqAB')
    var amount = 10;

    var transaction = new Transaction([
      { type: 'input', address: address.getServusKey(), amount: amount },
      { type: 'output', address: 'destination', amount: amount }
    ]);
    transaction.timestamp = 123141241;

    var signature1 = transaction.sign(address.getPrivateKey());
    assert.equal(signature1, validSignature);

    var signature2 = transaction.sign(address);
    assert.equal(signature2, validSignature);

    assert.equal(true, transaction.isValid());
  });
});
