var assert = require('assert');

var Address = require('../src/coin/Address');
var Constants = require('../src/utils/Constants');
var Transaction = require('../src/coin/Transaction');

describe('Transaction', function() {
  it('returns the addresses', function () {
    var address = new Address('L3MjaUBomjmPLjm8REPgmbBPB6aYQtMK8TMr71PhDuK6GHymHqAB')
    var amount = 10;
    var transaction = new Transaction([
      { type: 'input', address: address.getServusKey(), amount: amount },
      { type: 'output', address: 'destination', amount: amount }
    ]);
    assert.equal(address.getServusKey(), transaction.getAddress('input'));
    assert.equal('destination', transaction.getAddress('output'));
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
    assert.equal(Constants.OK, transaction.isValid());

    transaction.sign(address2.getPrivateKey());
    assert.equal(Constants.TransactionValidation.INVALID_SIGNATURE, transaction.isValid());
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

    assert.equal(Constants.OK, transaction.isValid());
  });

  describe('isValid()', () => {
    it('requires the correct signature', () => {
      var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');
      var address2 = new Address('KzBWsH29tFNNiggQor7fKyUKYX8fC59bYeMjYXSZ4pTg9h2bHrPG')

      var transaction = new Transaction([
        { type: 'output', address: address.getServusKey(), amount: Constants.miningReward }
      ])
      transaction.sign(address);
      assert.equal(Constants.OK, transaction.isValid());

      transaction.sign(address2);
      assert.equal(Constants.TransactionValidation.INVALID_SIGNATURE, transaction.isValid());
    });

    it('requires input amount to be equal to output amount', () => {
      var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');
      var address2 = new Address('KzBWsH29tFNNiggQor7fKyUKYX8fC59bYeMjYXSZ4pTg9h2bHrPG')

      transaction = new Transaction([
        { type: 'input', address: address.getServusKey(), amount: 1 },
        { type: 'output', address: address2.getServusKey(), amount: 2 }
      ])
      assert.equal(Constants.TransactionValidation.INVALID_AMOUNTS, transaction.isValid())
    });

    it('allows maximum 2 inputs per transaction', () => {
      var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');
      var address2 = new Address('KzBWsH29tFNNiggQor7fKyUKYX8fC59bYeMjYXSZ4pTg9h2bHrPG')
      var transaction = new Transaction([
        { type: 'input', address: address.getServusKey(), amount: 2 }
      ])
      assert.equal(Constants.TransactionValidation.INVALID_INPUTS, transaction.isValid())

      transaction = new Transaction([
        { type: 'input', address: address.getServusKey(), amount: 2 },
        { type: 'output', address: address2.getServusKey(), amount: 2 },
        { type: 'output', address: address2.getServusKey(), amount: 2 }
      ])
      assert.equal(Constants.TransactionValidation.INVALID_INPUTS, transaction.isValid())
    })

    it('takes care of minimum to send', () => {
      var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');
      var transaction = new Transaction([
        { type: 'input', address: address.getServusKey(), amount: Constants.minimumToSend - 0.001 },
        { type: 'output', address: 'caca2', amount: Constants.minimumToSend - 0.001 }
      ])
      assert.equal(Constants.TransactionValidation.MINIMUM_SEND, transaction.isValid())
    });

    it('has the correct decimals', () => {
      var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');
      var dividedNumber = 0.015;
      assert.equal(true, dividedNumber > Constants.minimumToSend);

      var transaction = new Transaction([
        { type: 'input', address: address.getServusKey(), amount: 0.015 },
        { type: 'output', address: 'caca2', amount: 0.015 }
      ])
      assert.equal(Constants.TransactionValidation.NUMBER_TOO_DIVIDED, transaction.isValid())
    });

    it('requires mining blocks to be equal to reward', () => {
      var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');
      var transaction = new Transaction([
        { type: 'output', address: address.getServusKey(), amount: 2 }
      ])
      assert.equal(Constants.TransactionValidation.INVALID_REWARD, transaction.isValid())
    });

    it('does not allow sending and receiving to the same address', () => {
      var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');
      var transaction = new Transaction([
        { type: 'input', address: address.getServusKey(), amount: 2 },
        { type: 'output', address: address.getServusKey(), amount: 2 }
      ])
      assert.equal(Constants.TransactionValidation.SAME_ADDRESS_ERROR, transaction.isValid())
    });

    it('requires an address', () => {
      var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');
      var transaction = new Transaction([
        { type: 'output', amount: 1 }
      ])
      assert.equal(Constants.TransactionValidation.MISSING_ADDRESS, transaction.isValid())
    });

    it('requires the transaction type', () => {
      var address = new Address('KxxDXEVmfUhhhhsxrWg2yQuteEhb9vSFh77guyX5pwLSWtfE3i6e');
      var transaction = new Transaction([
        { address: address.getServusKey(), amount: 1 }
      ])
      assert.equal(Constants.TransactionValidation.INVALID_TYPE, transaction.isValid());

      transaction = new Transaction([
        { type: 'foo', address: address.getServusKey(), amount: 1 }
      ])
      assert.equal(Constants.TransactionValidation.INVALID_TYPE, transaction.isValid());
    });
  });
});
