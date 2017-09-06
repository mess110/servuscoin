var fs = require('fs');

var Blockchain = require('./storage/LevelChain');
var Hodler = require('./storage/LevelHodler');

var blockchain = new Blockchain();
var hodler = new Hodler(blockchain, undefined);

var backupPath = './public/blocks.json';
if (fs.existsSync(backupPath)) {
  console.log('Creating LevelDB from ' + backupPath);
  var json = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  var tempBlocks = blockchain.isValidChain(json);
  if (tempBlocks === false) {
    console.error('fuck')
    return
  }
  console.log("Loading " + tempBlocks.length + " blocks");
  blockchain.setBlockchain(tempBlocks);
  console.log('Done');
} else {
  console.error(backupPath + ' does not exist!');
}
