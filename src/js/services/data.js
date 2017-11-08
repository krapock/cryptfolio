angular.module('coinBalanceApp')
  .factory('data', function(settings) {
    var data = {};
    data.config = {
      selectedCurrency: 'EUR',
      devmode: false,
    };
    data.currenciesConstants = {
      XBT: {
        userCurrency: false,
        symbol: 'BTC',
        decimals: 4
      },
      DASH: {
        userCurrency: false,
        symbol: 'DASH',
        decimals: 2
      },
      ETH: {
        userCurrency: false,
        symbol: '&Xi;',
        decimals: 2
      },
      EUR: {
        userCurrency: true,
        symbol: '&euro;',
        decimals: 2
      },
      USD: {
        userCurrency: true,
        symbol: '$',
        decimals: 2
      }
    };

    data.currenciesDefaults = {
      XBT: {
        active: true,
        owned: 1
      },
      DASH: {
        active: false,
        owned: 0
      },
      ETH: {
        active: true,
        owned: 0
      },
      EUR: {
        active: true,
        owned: 0
      },
      USD: {
        active: true,
        owned: 0
      }
    };

    data.currencies = {}
    angular.merge(data.currencies, data.currenciesDefaults, data.currenciesConstants);

    data.fetchSettings = () => {
      settings.fetch((rawUsrData) => {
        //        console.log("fetched settings");
        var usrData = JSON.parse(rawUsrData);
        if (usrData) {
          if (usrData.config) {
            angular.merge(data.config, usrData.config);
          }
          if (usrData.portfolio) {
            angular.merge(data.currencies, usrData.portfolio, data.currenciesConstants);
          }
        }
      });
    }

    data.saveSettings = () => {
      var usrData = {
        portfolio: {},
        config: {}
      };
      angular.merge(usrData.config, data.config);
      angular.merge(usrData.portfolio, data.currencies);
      var stringData = JSON.stringify(usrData);
      //      console.log("saving settings");
      settings.save(stringData);
    }

    data.setOwned = function(currency, owned) {
      data.currencies[currency].owned = owned;
      data.saveSettings();
    }

    //bootstrap
    data.fetchSettings();
    return data;
  });
