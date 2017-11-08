angular.module('coinBalanceApp')
  .controller('PortfolioController', function(menu, data, market, $scope) {

    var portfolio = this;
    portfolio.currencies = data.currencies;
    portfolio.tableData = {};
    portfolio.userCurrency = data.currencies[data.config.selectedCurrency];

    $scope.$watch(() => data.config.selectedCurrency, (curr) => {
      portfolio.userCurrency = data.currencies[curr];
      portfolio.refreshPortfolioTableData(market.rates);
    });

    portfolio.init = function() {
      portfolio.refreshPortfolioTableData(market.rates);
      market.addListener(function(data) {
        portfolio.refreshPortfolioTableData(data);
      });
    };

    portfolio.refreshPortfolioTableData = function(rates) {
      var userCurr = data.config.selectedCurrency;
      var total = {
        openingVal: 0,
        val: 0,
        moveVal: 0
      };
      for (var currency in data.currencies) {
        var conf = data.currencies[currency];
        var market = rates[currency];
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
          line.rate = market[userCurr].now;
          line.moveRate = market[userCurr].move;
          line.movePerc = market[userCurr].movePerc;

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
      menu.updateBadgeVal(portfolio.tableData.total.moveVal);
    }

    portfolio.setOwned = function(curr, num) {
      data.setOwned(curr, num);
    }

    //bootstrap
    portfolio.init();
  });
