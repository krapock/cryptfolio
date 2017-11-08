angular.module('coinBalanceApp')
  .factory('market', function(data, kraken) {
    var market = {
      rates: {},
      listeners: []
    };
    const STATIC_RATE = {
      opening: 1,
      now: 1,
      move: 0,
      movePerc: 0
    };

    market.init = function() {
      market.initStaticValues();
      market.linkToKraken();
    }
    market.initStaticValues = function() {
      for (var currency in data.currencies) {
        market.rates[currency] = {};
        market.rates[currency][currency] = STATIC_RATE;
      }
    }
    market.linkToKraken = function() {
      kraken.addListener(function(data) {
        for (var from in data) {
          for (var to in data[from]) {
            market.rates[from][to] = data[from][to];
          }
        }
        market.callback();
      });
      kraken.startTicker();
    }
    market.addListener = function(callback) {
      market.listeners.push(callback);
    }

    market.callback = function() {
      for (let i in market.listeners) {
        market.listeners[i](market.rates);
      }
    }

    market.init();
    return market;
  });
