angular.module('coinBalanceApp')
.controller('PortfolioController', function($http, $q) {

    var portfolio = this;
    portfolio.config = {
      selectedCurrency: 'EUR',
      devmode: false,
      fixtures: {
        krakenticker: {
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
      }
    };
    portfolio.currencies = {
      XBT: {
        active: true,
        userCurrency: false,
        symbol: 'BTC',
        owned: 0.44674
      },
      DASH: {
        active: true,
        userCurrency: false,
        symbol: 'DASH',
        owned: 0
      },
      ETH: {
        active: true,
        userCurrency: false,
        symbol: '&Xi;',
        owned: 9.77817
      },
      EUR: {
        active: true,
        userCurrency: true,
        symbol: '&euro;',
        owned: 500
      },
      USD: {
        active: true,
        userCurrency: false,
        symbol: '$',
        owned: 0
      }
    };
    portfolio.market = {};
    portfolio.apiMetas = {
      kraken: {
        currencies: {
          USD: {
            name: 'ZUSD'
          },
          EUR: {
            name: 'ZEUR'
          },
          ETH: {
            name: 'XETH'
          },
          DASH: {
            name: 'DASH'
          },
          XBT: {
            name: 'XXBT'
          }
        }
      }
    };
    portfolio.tableData = {};



    portfolio.init = function() {
      portfolio.initializeMarketValues();
      portfolio.updateKrakenValues();
    };

    portfolio.initializeMarketValues = function() {
      for (var currency in portfolio.currencies) {
        portfolio.market[currency] = {};
        portfolio.market[currency][currency] = {
          opening: 1,
          val: 1
        };
      }
      portfolio.refreshPortfolioTableData();
    };

        portfolio.refreshPortfolioTableData = function() {
          var userCurr = portfolio.config.selectedCurrency;
          var total = {
            openingVal: 0,
            val: 0,
            moveVal: 0
          };
          for (var currency in portfolio.currencies) {
            var conf = portfolio.currencies[currency];
            var market = portfolio.market[currency];
            var line = {
              openingRate: 0,
              rate: 0,
              movePerc: 0,
              openingVal: 0,
              val: 0,
              moveVal: 0
            };

            if (market[userCurr]) {
              line.openingRate = market[userCurr].opening;
              line.rate = market[userCurr].val;
              line.movePerc = line.rate * 100 / line.openingRate;
              line.openingVal = line.openingRate * conf.owned;
              line.val = line.rate * conf.owned;
              line.moveVal = line.val - line.openingVal;

              total.openingVal += line.openingVal;
              total.val += line.val;
              total.moveVal += line.moveVal;
            }

            portfolio.tableData[currency] = line;
          }
          portfolio.tableData.total = total;
        }


    portfolio.updateKrakenValues = function(){
      portfolio.getKrakenTransactionValues().then(function() {
        portfolio.refreshPortfolioTableData();
        setTimeout(portfolio.updateKrakenValues,5000);
      });
    }

    portfolio.getKrakenTransactionValues = function() {
      var apiCurrencies = portfolio.apiMetas.kraken.currencies;

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
        if (portfolio.config.devmode) {
          console.info("fake kraken call");
          deferred = $q.defer();
          setTimeout(function() {
            deferred.resolve({
              data: portfolio.config.fixtures.krakenticker
            });
          }, 500);
          return (deferred.promise);
        } else {
          return $http.get("https://api.kraken.com/0/public/Ticker?pair=" +
            pairs);
        }
      }

      var krakenCall = fetchKrakenTickValues(this.currencies);
      krakenCall.then(function(call) {
        portfolio.market.DASH['EUR'] = {
          'opening': call.data.result.DASHEUR.o,
          'val': call.data.result.DASHEUR.c[0]
        };
        portfolio.market.XBT['EUR'] = {
          'opening': call.data.result.XXBTZEUR.o,
          'val': call.data.result.XXBTZEUR.c[0]
        };
        portfolio.market.ETH['EUR'] = {
          'opening': call.data.result.XETHZEUR.o,
          'val': call.data.result.XETHZEUR.c[0]
        }
      });
      return krakenCall;
    }

    //bootstrap
    portfolio.init();
  });