angular.module('coinBalanceApp')
  .controller('PortfolioController', function(persist, menu, data, market,
    $scope) {
    const STORE_KEY = "coin-balance-portfolio";

    var portfolio = this;
    portfolio.currencies = data.currencies;
    portfolio.tableData = {};
    portfolio.userCurrency = data.currencies[data.config.selectedCurrency];

    $scope.$watch(() => data.config.selectedCurrency, (curr) => {
      if (portfolio.userCurrency != data.currencies[curr]) {
        portfolio.userCurrency = data.currencies[curr];
        portfolio.refreshPortfolioTableData(market.rates);
      }
    });

    portfolio.init = function() {
      portfolio.fetch();
      market.addListener(function(rates) {
        portfolio.refreshPortfolioTableData(rates);
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
      menu.updateLine1Val(portfolio.tableData["XBT"].rate);
      menu.updateLine2Val(portfolio.tableData.total.moveVal);
      menu.updateTooltip(
        "BTC:"
        + portfolio.tableData["XBT"].rate 
        + " | "
        + (portfolio.tableData["XBT"].movePerc > 0 ? '+' : '')
        + (Math.round(portfolio.tableData["XBT"].movePerc * 100) / 100)
        + "%"
        + " | "
        + (new Date().toString().replace(/^.* (\d+:\d+:\d+) .*$/,"$1"))
      );
      portfolio.save();
    }

    portfolio.setOwned = function(curr, num) {
      data.setOwned(curr, num);
    }

    portfolio.save = function() {
      persist.save(STORE_KEY, portfolio.tableData);
    }
    portfolio.fetch = function() {
      persist.fetch(STORE_KEY, (fetched) => angular.merge(portfolio.tableData,
        fetched));
    }

    //bootstrap
    portfolio.init();
  });
