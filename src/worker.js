const Address = require('./coin/Address');
const Miner = require('./coin/Miner');

onmessage = function(e) {
  var addressPrivate = e.data[0];
  var info = e.data[1];

  address = new Address(addressPrivate);
  console.log("Mining started! Difficulty: " + info.difficulty);
  var miner = new Miner(address);
  miner.difficulty = info.difficulty;
  var newBlock = miner.mineFor(info.lastBlock, info.memPool);

  console.log("Block " + newBlock.index + " found");
  postMessage(newBlock);
}
