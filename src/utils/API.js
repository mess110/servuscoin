var fs = require('fs');
var request = require('request');

var Block = require('../coin/Block');
var Constants = require('./Constants');

module.exports = class API {
  constructor(baseUrl) {
    // TODO: check valid and ending in /
    this.baseUrl = baseUrl || process.env.HTTP_BASE_URL || Constants.url;
  }

  getInfo(callback) {
    this._getJSON('info', callback);
  }

  getLastBlock(callback) {
    this._getJSON('blocks', function (data) {
      callback(data.pop());
    });
  }

  announceBlock(newBlock, callback) {
    if (!(newBlock instanceof Block)) {
      console.log('what are you minig?');
      return;
    }
    this._postJSON('block', newBlock.toObject(), callback);
  }

  createTransaction(transaction, callback) {
    this._postJSON('transaction', transaction, callback);
  }

  getBalance(address, callback) {
    this._getJSON('balance?address=' + address, callback);
  }

  _getJSON(url, callback) {
    request.get({
      url: this.baseUrl + url
    }, function (error, response, body) {
      if (error) {
        console.error(error);
      }
      if (!error && response.statusCode == 200) {
        var json = JSON.parse(body);
        callback(json);
      }
    });
  }

  _postJSON(url, json, callback) {
    request.post(
      this.baseUrl + url,
      { json: json },
      function (error, response, body) {
        if (error) {
          console.error(error);
        }
        if (!error && response.statusCode == 200) {
          callback(body);
        }
        if (!error && response.statusCode == 400) {
          callback(body)
        }
      }
    );
  }
}
