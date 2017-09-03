const Instascan = require('instascan');

const Address = require('./coin/Address');
const API = require('./utils/API');
const Block = require('./coin/Block');
const Constants = require('./utils/Constants');
const Miner = require('./coin/Miner');
const Transaction = require('./coin/Transaction');

module.exports = {
  Instascan: Instascan,

  Address: Address,
  API: API,
  Block: Block,
  Constants: Constants,
  Miner: Miner,
  Transaction: Transaction
}
