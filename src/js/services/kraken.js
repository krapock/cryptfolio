angular.module('coinBalanceApp')
  .factory('kraken', function(data, $http, $q) {

    var kraken = {
      data: {
        market: {}
      },
      listeners: []
    };
    const DAY_IN_SEC = 60 * 60 * 24;
    const RATE = {
      opening: 1,
      now: 1,
      move: 0,
      movePerc: 0
    };
    const currenciesMap = {
      USD: 'ZUSD',
      EUR: 'ZEUR',
      ETH: 'XETH',
      DASH: 'DASH',
      XBT: 'XXBT'
    }
    const tuples = {
      "DASHEUR": {
        base: "DASH",
        target: "EUR"
      },
      "XXBTZEUR": {
        base: "XBT",
        target: "EUR"
      },
      "XETHZEUR": {
        base: "ETH",
        target: "EUR"
      },
      "DASHUSD": {
        base: "DASH",
        target: "USD"
      },
      "XXBTZUSD": {
        base: "XBT",
        target: "USD"
      },
      "XETHZUSD": {
        base: "ETH",
        target: "USD"
      }
    };

    const fixtures = {
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

    kraken.addListener = function(callback) {
      kraken.listeners.push(callback);
    }

    kraken.callback = function() {
      for (let i in kraken.listeners) {
        kraken.listeners[i](kraken.data.market);
      }
    }

    kraken.startTicker = function() {
      kraken.getValuesByOhlc().finally(function() {
        setTimeout(kraken.startTicker, data.config.refreshdelay);
      });
    }

    kraken.initializeMarketValues = function() {
      for (var currency in data.currencies) {
        kraken.data.market[currency] = {};
      }
    };

    kraken.getPair = function(base, target) {
      for (pair in tuples) {
        if (tuples[pair].base == base && tuples[pair].target == target) {
          return pair;
        }
      }
      return "UNKNOWN";
    }

    kraken.getCurrencyPairList = function() {
      var baseCurrencies = [];
      var targetCurrencies = [];
      for (let c in data.currencies) {
        if (data.currencies[c].active) baseCurrencies.push(c);
        if (data.currencies[c].userCurrency) targetCurrencies.push(c);
      }

      var pairs = [];
      for (let base in baseCurrencies) {
        for (let target in targetCurrencies) {
          let basename = baseCurrencies[base];
          let targetName = targetCurrencies[target];
          //avoid same assets and fiat-to-fiat
          if (basename != targetName &&
            (!data.currencies[basename].userCurrency || !data.currencies[
                targetName]
              .userCurrency)) {
            pairs.push(kraken.getPair(basename, targetName));
          }
        }
      }
      return pairs;
    };
    kraken.callKrakenTicker = function() {
      let pairs = kraken.getCurrencyPairList();
      if (data.config.devmode) {
        console.info("fake kraken call");
        deferred = $q.defer();
        setTimeout(function() {
          deferred.resolve({
            data: fixtures.ticker
          });
        }, 500);
        return (deferred.promise);
      } else {
        return $http.get("https://api.kraken.com/0/public/Ticker?pair=" +
          pairs.join(','));
      }
    }
    kraken.getValuesByTicker = function() {
      var krakenCall = kraken.callKrakenTicker();
      krakenCall.then(function(call) {
        var result = call.data.result;
        for (let tupleName in tuples) {
          var tuple = tuples[tupleName];
          if (kraken.data.market[tuple.base] && result[tupleName]) {
            var op = result[tupleName].o; //price at opening
            //var now = result[tuple.name].c[0]; //last trade price
            var now = result[tupleName].p[0]; //average mean-by-volume price now
            //var now = result[tuple.name].p[1]; //average mean-by-volume price over 24h
            kraken.data.market[tuple.base][tuple.target] = {
              'opening': op,
              'now': now,
              'move': now - op,
              'movePerc': (now - op) * 100 / op
            };
          }
        }
        kraken.callback();
      });
      return krakenCall;
    }

    kraken.callOhlc = function(pair) {

      let sinceDate = Math.floor(new Date().getTime() / 1000) - DAY_IN_SEC -
        600;
      return $http.get("https://api.kraken.com/0/public/OHLC?pair=" + pair +
        "&interval=5&since=" + sinceDate);
    }
    kraken.getValuesByOhlc = function() {
        let pairs = kraken.getCurrencyPairList();
        let calls = [];
        for (let pairNb in pairs) {
          let pair = pairs[pairNb];
          let call = kraken.callOhlc(pair);
          call.then(call => {
            var result = call.data.result;
            let tuple = tuples[Object.keys(result)[0]];
            let nowDate = result[pair][result[pair].length - 1][0];
            let now = result[pair][result[pair].length - 1][4];

            let op = result[pair][0][1];
            let opDate = nowDate - (DAY_IN_SEC);
            for (let resultNb in result[pair]) {
              var entryDate = result[pair][resultNb][0];
              if (entryDate == opDate) {
                op = result[pair][resultNb][1];
                console.info("Entry found on #" + resultNb + "/" + result[
                  pair].length);
                break;
              }
            }

            kraken.data.market[tuple.base][tuple.target] = {
              'opening': op,
              'now': now,
              'move': now - op,
              'movePerc': (now - op) * 100 / op
            };
          });
          calls.push(call);
        }
        var generalPromise = $q.all(calls);
        generalPromise.then(kraken.callback);
        return generalPromise;
      }
      //for each pair :
      // date == Math.floor(new Date().getTime()/1000)-1440
      // https://api.kraken.com/0/public/OHLC?pair=XBTCZEUR&since=1510212072
      // opening = response.result.XXBTZEUR[0][1]
      // closing = response.result.XXBTZEUR[-1][4]

    kraken.initializeMarketValues();
    return kraken;
  });
