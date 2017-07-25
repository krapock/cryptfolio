angular.module('coinBalanceApp')
  .controller('PortfolioController', function(data, $http, $q) {

    var portfolio = this;
    portfolio.currencies = data.currencies;
    portfolio.market = {};
    portfolio.tableData = {};
    portfolio.userSymbol = data.currencies[data.config.selectedCurrency].symbol;


    portfolio.init = function() {
      portfolio.initializeMarketValues();
      portfolio.updateKrakenValues();
    };

    portfolio.initializeMarketValues = function() {
      for (var currency in data.currencies) {
        portfolio.market[currency] = {};
        portfolio.market[currency][currency] = {
          opening: 1,
          val: 1
        };
      }
      portfolio.refreshPortfolioTableData();
    };

    portfolio.refreshPortfolioTableData = function() {
      var userCurr = data.config.selectedCurrency;
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
          line.moveRate = line.rate - line.openingRate;
          line.movePerc = (line.moveRate * 100) / line.openingRate;

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


    portfolio.updateKrakenValues = function() {
      portfolio.getKrakenTransactionValues().then(function() {
        portfolio.refreshPortfolioTableData();
        setTimeout(portfolio.updateKrakenValues, 5000);
      });
    }

    portfolio.getKrakenTransactionValues = function() {
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
              data: data.config.fixtures.krakenticker
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
        if (portfolio.market.DASH && result.DASHEUR) {
          portfolio.market.DASH['EUR'] = {
            'opening': result.DASHEUR.o,
            'val': result.DASHEUR.c[0]
          };
        }
        if (portfolio.market.XBT && result.XXBTZEUR) {
          portfolio.market.XBT['EUR'] = {
            'opening': result.XXBTZEUR.o,
            'val': result.XXBTZEUR.c[0]
          };
        }
        if (portfolio.market.ETH && result.XETHZEUR) {
          portfolio.market.ETH['EUR'] = {
            'opening': result.XETHZEUR.o,
            'val': result.XETHZEUR.c[0]
          }
        }
      });
      return krakenCall;
    }

    //bootstrap
    portfolio.init();
  });
