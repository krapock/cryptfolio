angular.module('coinBalanceApp')
  .controller('PortfolioController', function(data, kraken, $scope) {

    var portfolio = this;
    portfolio.currencies = data.currencies;
    portfolio.market = {};
    portfolio.tableData = {};
    portfolio.userCurrency = data.currencies[data.config.selectedCurrency];

    $scope.$watch(() => data.config.selectedCurrency, (curr) => {
      portfolio.userCurrency = data.currencies[curr];
      portfolio.refreshPortfolioTableData();
    });


    portfolio.init = function() {
      portfolio.initializeMarketValues();
      kraken.addListener(function(data) {
        for (var from in data) {
          for (var to in data) {
            portfolio.market[from][to] = data[from][to];
          }
        }
        portfolio.refreshPortfolioTableData();
      });
      kraken.startTicker();
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
          total.movePerc = (total.moveVal * 100) / total.openingVal;
        }

        portfolio.tableData[currency] = line;
      }
      portfolio.tableData.total = total;
    }

    portfolio.setOwned = function(curr, num) {
      data.setOwned(curr, num);
    }

    //bootstrap
    portfolio.init();
  });
