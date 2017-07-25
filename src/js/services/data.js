angular.module('coinBalanceApp')
  .factory('data', function() {
    var data = {};
    data.config = {
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
      },
    };
    data.currencies = {
      XBT: {
        active: true,
        userCurrency: false,
        symbol: 'BTC',
        owned: 0.81438
      },
      DASH: {
        active: false,
        userCurrency: false,
        symbol: 'DASH',
        owned: 0
      },
      ETH: {
        active: true,
        userCurrency: false,
        symbol: '&Xi;',
        owned: 5
      },
      EUR: {
        active: true,
        userCurrency: true,
        symbol: '&euro;',
        owned: 500
      },
      USD: {
        active: false,
        userCurrency: false,
        symbol: '$',
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

    return data;
  });
