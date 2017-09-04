var express = require("express");
var fs = require('fs');
var bodyParser = require('body-parser');
var cors = require('cors');

var Constants = require('./Constants');
var Transaction = require('../coin/Transaction');

module.exports = class HttpServer {
  constructor(httpPort, p2p, blockchain, memPool) {
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
      var hasFunds = tempTransaction.getAmount('input') <= this.getBalance(tempTransaction.getAddress('input'), blockchain, memPool).balance;

      if (tempTransaction.isValid() === Constants.OK && hasFunds) {
        memPool.add(obj);
        this.sendJson(res, obj);
      } else {
        res.status(400);
        // TOOD: say why invalid
        this.sendJson(res, { error: 'invalid transaction' });
      }
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

    app.get('/blocks', (req, res) => {
      this.sendJson(res, blockchain.getBlockchain());
    });
    app.post('/block', (req, res) => {
      var newBlock = blockchain.generateNextBlock(req.body);
      var added = blockchain.addNewBlock(newBlock) && memPool.hasTransactions(newBlock.data.transactions);
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
      this.sendJson(res, this.getBalance(req.query.address, blockchain, memPool));
    });

    app.get('/peers', (req, res) => {
      var data = p2p.sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort);
      this.sendJson(res, data);
    });
    app.post('/peer', (req, res) => {
      p2p.connectToPeers([req.body.peer]);
      this.sendJson(res, {});
    });
    server.listen(httpPort, () => console.log('Listening http on port: ' + httpPort));
  }

  sendJson(res, obj) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(obj));
  }

  getBalance(address, blockchain, memPool) {
    var balance = blockchain.getBalance(address);
    balance.balance += memPool.getBalance(address).balance;
    return balance;
  }

  static initHttpServer(httpPort, p2p, blockchain, memPool) {
    return new HttpServer(httpPort, p2p, blockchain, memPool)
  }
}
