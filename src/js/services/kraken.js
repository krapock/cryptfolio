angular.module('coinBalanceApp')
  .factory('kraken', function(data, $http, $q) {

    var kraken = {
      data: {
        market: {}
      },
      listeners: []
    };

    kraken.addListener = function(callback) {
      kraken.listeners.push(callback);
    }

    kraken.callback = function() {
      for (let i in kraken.listeners) {
        kraken.listeners[i](kraken.data.market);
      }
    }

    kraken.fixtures = {
      ticker: {
        "error": [],
        "result": {
          "DASHEUR": {
            "a": ["156.999960", "1", "1.000"],
            "b": ["155.520780", "8", "8.000"],
            "c": ["155.520590", "1.60401431"],
            "v": ["287.84991203", "2516.31904935"],
            "p": ["157.014732", "155.872282"],
            "t": [220, 1078],
            "l": ["153.100590", "150.820010"],
            "h": ["158.759560", "162.967930"],
            "o": "153.990000"
          },
          "XETHZEUR": {
            "a": ["255.99000", "6", "6.000"],
            "b": ["255.60015", "1", "1.000"],
            "c": ["255.99000", "4.16781406"],
            "v": ["29951.63638439", "180158.49554444"],
            "p": ["254.43974", "262.11348"],
            "t": [6582, 35335],
            "l": ["250.02000", "250.02000"],
            "h": ["261.72000", "281.83717"],
            "o": "256.49993"
          },
          "XXBTZEUR": {
            "a": ["2201.50000", "1", "1.000"],
            "b": ["2200.01000", "13", "13.000"],
            "c": ["2201.68000", "0.84952373"],
            "v": ["1712.99664915", "8876.39917875"],
            "p": ["2208.10158", "2224.47225"],
            "t": [5007, 25920],
            "l": ["2188.66000", "2187.13000"],
            "h": ["2232.00000", "2265.00000"],
            "o": "2213.20000"
          }
        }
      }
    };

    kraken.startTicker = function() {
      kraken.getKrakenTransactionValues().then(function() {
        kraken.callback();
        setTimeout(kraken.startTicker, 5000);
      });
    }

    kraken.initializeMarketValues = function() {
      for (var currency in data.currencies) {
        kraken.data.market[currency] = {};
        kraken.data.market[currency][currency] = {
          opening: 1,
          val: 1
        };
      }
    };

    kraken.getKrakenTransactionValues = function() {
      var apiCurrencies = data.apiMetas.kraken.currencies;

      var getCurrencyPairList = function(baseCurrencies, targetCurrencies,
        apiCurrencies) {
        var pairs = [];
        for (let base in baseCurrencies) {
          for (let target in targetCurrencies) {
            let basename = apiCurrencies[baseCurrencies[base]].name;
            let targetName = apiCurrencies[targetCurrencies[target]].name;
            //avoid same assets and fiat-to-fiat
            if (basename != targetName &&
              (!basename.startsWith('Z') || !targetName.startsWith('Z'))) {

              pairs.push(basename.replace(/^[XZ]/, '') + targetName.replace(
                /^[XZ]/, ''));
            }
          }
        }
        return pairs.join(',');
      };

      var fetchKrakenTickValues = function(currenciesPrefs) {
        var bases = [];
        var targets = [];
        for (let c in currenciesPrefs) {
          if (currenciesPrefs[c].active) bases.push(c);
          if (currenciesPrefs[c].userCurrency) targets.push(c);
        }
        var pairs = getCurrencyPairList(bases, targets, apiCurrencies);
        return fetchKrakenTickerData(pairs);
      }

      var fetchKrakenTickerData = function(pairs) {
        if (data.config.devmode) {
          console.info("fake kraken call");
          deferred = $q.defer();
          setTimeout(function() {
            deferred.resolve({
              data: kraken.fixtures.ticker
            });
          }, 500);
          return (deferred.promise);
        } else {
          return $http.get("https://api.kraken.com/0/public/Ticker?pair=" +
            pairs);
        }
      }

      var krakenCall = fetchKrakenTickValues(data.currencies);

      krakenCall.then(function(call) {
        var result = call.data.result;
        if (kraken.data.market.DASH && result.DASHEUR) {
          kraken.data.market.DASH['EUR'] = {
            'opening': result.DASHEUR.o,
            'val': result.DASHEUR.c[0]
          };
        }
        if (kraken.data.market.XBT && result.XXBTZEUR) {
          kraken.data.market.XBT['EUR'] = {
            'opening': result.XXBTZEUR.o,
            'val': result.XXBTZEUR.c[0]
          };
        }
        if (kraken.data.market.ETH && result.XETHZEUR) {
          kraken.data.market.ETH['EUR'] = {
            'opening': result.XETHZEUR.o,
            'val': result.XETHZEUR.c[0]
          }
        }
      });
      return krakenCall;
    }


    kraken.initializeMarketValues();
    return kraken;
  });
