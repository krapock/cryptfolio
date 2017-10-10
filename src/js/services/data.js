angular.module('coinBalanceApp')
  .factory('data', function(settings) {
    var data = {};
    data.config = {
      selectedCurrency: 'EUR',
      devmode: false,
    };
    data.currencies = {
      XBT: {
        active: true,
        userCurrency: false,
        symbol: 'BTC',
        decimals: 4,
        owned: 0
      },
      DASH: {
        active: false,
        userCurrency: false,
        symbol: 'DASH',
        decimals: 2,
        owned: 0
      },
      ETH: {
        active: true,
        userCurrency: false,
        symbol: '&Xi;',
        decimals: 2,
        owned: 0
      },
      EUR: {
        active: true,
        userCurrency: true,
        symbol: '&euro;',
        decimals: 2,
        owned: 0
      },
      USD: {
        active: false,
        userCurrency: false,
        symbol: '$',
        decimals: 2,
        owned: 0
      }
    };
    data.apiMetas = {
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

    data.fetchSettings = () => {
      settings.fetch((rawUsrData) => {
        //        console.log("fetched settings");
        var usrData = JSON.parse(rawUsrData);
        if (usrData && usrData.portfolio) {
          for (var curr in usrData.portfolio) {
            data.currencies[curr].active = usrData.portfolio[curr].active;
            data.currencies[curr].owned = usrData.portfolio[curr].owned;
            data.currencies[curr].userCurrency = usrData.portfolio[curr]
              .userCurrency;
          }
        }
      });
    }

    data.saveSettings = () => {
      var usrData = {
        portfolio: {}
      };
      for (var curr in data.currencies) {
        usrData.portfolio[curr] = {
          active: data.currencies[curr].active,
          userCurrency: data.currencies[curr].userCurrency,
          owned: data.currencies[curr].owned,
        }
      }
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
