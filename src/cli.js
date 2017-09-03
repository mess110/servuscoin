var Address = require('./coin/Address');
var API = require('./utils/API');
var Constants = require('./utils/Constants');
var Miner = require('./coin/Miner');

// needed for self signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var api = new API();
var address = new Address(process.env.MINE_ADDRESS);
var miner = new Miner(address);

api.getInfo(function (info) {
  miner.difficulty = info.difficulty;
  var newBlock = miner.mineFor(info.lastBlock);
  api.announceBlock(newBlock, function (data) {
    console.log(data);
  });
});
