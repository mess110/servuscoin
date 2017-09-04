var t = require('./TestHelper.js');

var Constants = require('../src/utils/Constants');
var Transaction = require('../src/coin/Transaction');

describe('Transaction', function() {
  it('returns the addresses', function () {
    var address = t.address;
    var amount = 10;
    var transaction = new Transaction([
      { type: 'input', address: address.getServusKey(), amount: amount },
      { type: 'output', address: 'destination', amount: amount }
    ]);
    t.assert.equal(address.getServusKey(), transaction.getAddress('input'));
    t.assert.equal('destination', transaction.getAddress('output'));
  });

  it('is valid for correctly signed inputs', function () {
    var address = t.address;
    var address2 = t.address2;

    var amount = 10;
    var transaction = new Transaction([
      { type: 'input', address: address.getServusKey(), amount: amount },
      { type: 'output', address: 'destination', amount: amount }
    ]);
    transaction.sign(address.getPrivateKey());
    t.assert.equal(Constants.OK, transaction.isValid());

    transaction.sign(address2.getPrivateKey());
    t.assert.equal(Constants.TransactionValidation.INVALID_SIGNATURE, transaction.isValid());
  });

  it('can sign messages', function () {
    var validSignature = 'H+A3fD3J1Df7vvPSVFrsGQAq4j3EYW547CzJXD30H2MRfNiQ6R1WPh2P2bXg8uJ4ufPVZ+1zzr+zXPiZW+Ugays=';
    var address = t.address;
    var amount = 10;

    var transaction = new Transaction([
      { type: 'input', address: address.getServusKey(), amount: amount },
      { type: 'output', address: 'destination', amount: amount }
    ]);
    transaction.timestamp = 123141241;

    var signature1 = transaction.sign(address.getPrivateKey());
    t.assert.equal(signature1, validSignature);

    var signature2 = transaction.sign(address);
    t.assert.equal(signature2, validSignature);

    t.assert.equal(Constants.OK, transaction.isValid());
  });

  describe('isValid()', () => {
    it('requires the correct signature', () => {
      var address = t.address;
      var address2 = t.address2;

      var transaction = new Transaction([
        { type: 'output', address: address.getServusKey(), amount: Constants.miningReward }
      ])
      transaction.sign(address);
      t.assert.equal(Constants.OK, transaction.isValid());

      transaction.sign(address2);
      t.assert.equal(Constants.TransactionValidation.INVALID_SIGNATURE, transaction.isValid());
    });

    it('requires input amount to be equal to output amount', () => {
      var address = t.address;
      var address2 = t.address2;

      transaction = new Transaction([
        { type: 'input', address: address.getServusKey(), amount: 1 },
        { type: 'output', address: address2.getServusKey(), amount: 2 }
      ])
      t.assert.equal(Constants.TransactionValidation.INVALID_AMOUNTS, transaction.isValid())
    });

    it('allows maximum 2 inputs per transaction', () => {
      var address = t.address;
      var address2 = t.address2;

      var transaction = new Transaction([
        { type: 'input', address: address.getServusKey(), amount: 2 }
      ])
      t.assert.equal(Constants.TransactionValidation.INVALID_INPUTS, transaction.isValid())

      transaction = new Transaction([
        { type: 'input', address: address.getServusKey(), amount: 2 },
        { type: 'output', address: address2.getServusKey(), amount: 2 },
        { type: 'output', address: address2.getServusKey(), amount: 2 }
      ])
      t.assert.equal(Constants.TransactionValidation.INVALID_INPUTS, transaction.isValid())
    })

    it('takes care of minimum to send', () => {
      var address = t.address;
      var transaction = new Transaction([
        { type: 'input', address: address.getServusKey(), amount: Constants.minimumToSend - 0.001 },
        { type: 'output', address: 'caca2', amount: Constants.minimumToSend - 0.001 }
      ])
      t.assert.equal(Constants.TransactionValidation.MINIMUM_SEND, transaction.isValid())
    });

    it('has the correct decimals', () => {
      var address = t.address;
      var dividedNumber = 0.015;
      t.assert.equal(true, dividedNumber > Constants.minimumToSend);

      var transaction = new Transaction([
        { type: 'input', address: address.getServusKey(), amount: 0.015 },
        { type: 'output', address: 'caca2', amount: 0.015 }
      ])
      t.assert.equal(Constants.TransactionValidation.NUMBER_TOO_DIVIDED, transaction.isValid())
    });

    it('requires mining blocks to be equal to reward', () => {
      var address = t.address;
      var transaction = new Transaction([
        { type: 'output', address: address.getServusKey(), amount: 2 }
      ])
      t.assert.equal(Constants.TransactionValidation.INVALID_REWARD, transaction.isValid())
    });

    it('does not allow sending and receiving to the same address', () => {
      var address = t.address;
      var transaction = new Transaction([
        { type: 'input', address: address.getServusKey(), amount: 2 },
        { type: 'output', address: address.getServusKey(), amount: 2 }
      ])
      t.assert.equal(Constants.TransactionValidation.SAME_ADDRESS_ERROR, transaction.isValid())
    });

    it('requires an address', () => {
      var address = t.address;
      var transaction = new Transaction([
        { type: 'output', amount: 1 }
      ])
      t.assert.equal(Constants.TransactionValidation.MISSING_ADDRESS, transaction.isValid())
    });

    it('requires the transaction type', () => {
      var address = t.address;
      var transaction = new Transaction([
        { address: address.getServusKey(), amount: 1 }
      ])
      t.assert.equal(Constants.TransactionValidation.INVALID_TYPE, transaction.isValid());

      transaction = new Transaction([
        { type: 'foo', address: address.getServusKey(), amount: 1 }
      ])
      t.assert.equal(Constants.TransactionValidation.INVALID_TYPE, transaction.isValid());
    });
  });
});
