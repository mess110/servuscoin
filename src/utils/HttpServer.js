var express = require("express");
var fs = require('fs');
var bodyParser = require('body-parser');
var cors = require('cors');

var Constants = require('./Constants');
var Transaction = require('../coin/Transaction');

module.exports = class HttpServer {
  constructor(httpPort, p2p, hodler) {
    this.hodler = hodler;
    var blockchain = hodler.blockchain;
    var memPool = hodler.memPool;

    var app = express();
    app.use(express.static('public'))

    var server = require('https').createServer({
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem')
    }, app);

    app.use(bodyParser.json());
    app.use(cors())

    app.get('/info', (req, res) => {
      this.sendJson(res, {
        difficulty: blockchain.difficulty,
        manualDifficulty: Constants.manualDifficulty,
        adjustBlockCount: blockchain.adjustBlockCount,
        version: Constants.version,
        url: Constants.url,
        memPool: memPool.get(),
        lastBlock: blockchain.getLatestBlock(),
      });
    });

    app.post('/transaction', (req, res) => {
      var obj = req.body;
      var tempTransaction = Transaction.fromObject(obj);
      var inputAddress = tempTransaction.getAddress('input');

      hodler.getBalance(inputAddress, (balance) => {
        var hasFunds = tempTransaction.getAmount('input') <= balance.balance;
        var valid = tempTransaction.isValid();

        if (valid === Constants.OK && hasFunds) {
          memPool.add(obj);
          this.sendJson(res, obj);
        } else {
          res.status(400);
          // TOOD: say why invalid
          this.sendJson(res, { error: 'invalid transaction ' + valid });
        }
      });
    });
    app.get('/transactions', (req, res) => {
      this.sendJson(res, memPool.get());
    });

    if (Constants.manualDifficulty === true) {
      app.get('/dec', (req, res) => {
        blockchain.difficulty -= 1;
        this.sendJson(res, { difficulty: blockchain.difficulty });
      });

      app.get('/inc', (req, res) => {
        blockchain.difficulty += 1;
        this.sendJson(res, { difficulty: blockchain.difficulty });
      });
    }

    app.get('/history', (req, res) => {
      hodler.getHistory((blocks) => {
        this.sendJson(res, blocks);
      });
    });
    app.get('/blocks', (req, res) => {
      this.sendJson(res, blockchain.getBlockchain());
    });
    app.post('/block', (req, res) => {
      var newBlock = blockchain.generateNextBlock(req.body);
      var blockInMemPool = memPool.hasTransactions(newBlock.data.transactions);
      var added = blockchain.addNewBlock(newBlock) && blockInMemPool;
      if (added) {
        memPool.remove(newBlock.data.transactions);
        p2p.broadcast(p2p.responseLatestMsg());
        console.log('block added: ' + JSON.stringify(newBlock));
        this.sendJson(res, blockchain.getLatestBlock());
      } else {
        console.log('block not added: ' + JSON.stringify(newBlock));
        res.status(400);
        this.sendJson(res, blockchain.getLatestBlock());
      }
    });

    app.get('/balance', (req, res) => {
      // TODO: what if no address
      hodler.getBalance(req.query.address, (balance) => {
        this.sendJson(res, balance);
      })
    });

    app.get('/peers', (req, res) => {
      var data = p2p.sockets.map(s => {
        s._socket.remoteAddress + ':' + s._socket.remotePort
      });
      this.sendJson(res, data);
    });
    app.post('/peer', (req, res) => {
      p2p.connectToPeers([req.body.peer]);
      this.sendJson(res, {});
    });
    server.listen(httpPort, () => {
      console.log('Listening http on port: ' + httpPort)
    });
  }

  sendJson(res, obj) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(obj));
  }
}
