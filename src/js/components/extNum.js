angular.module('coinBalanceApp')
  .component('extNum', {
    templateUrl: 'templates/extNum.html',
    controller: function($filter) {
      var ctrl = this;

      ctrl.number = 0;
      ctrl.decimals = 2;
      ctrl.globalMove = '=';
      ctrl.tickMove = '=';
      ctrl.numberShown = '0.00';
      ctrl.symbol = '';
      ctrl.editable = false;
      ctrl.isEdited = false;
      ctrl.editValue = "";
      ctrl.onEdit = 'oopz';

      ctrl.$onChanges = function(changes) {
          ctrl.setPrefs(changes.currency, changes.decimals, changes.symbol);
          ctrl.update(changes);
        },
        ctrl.setPrefs = function(currency, decimals, symbol) {
          if (currency && currency.currentValue && currency.currentValue.decimals) {
            ctrl.decimals = currency.currentValue.decimals;
          }
          if (currency && currency.currentValue && currency.currentValue.symbol) {
            ctrl.symbol = currency.currentValue.symbol;
          }
          if (decimals && decimals.currentValue) {
            ctrl.decimals = decimals.currentValue;
          }
          if (symbol && symbol.currentValue) {
            ctrl.symbol = symbol.currentValue;
          }
        }

      ctrl.update = function(changes) {

          var valueThreshold = Math.pow(0.1, ctrl.decimals || 2);

          if (ctrl.number > valueThreshold) {
            ctrl.globalMove = '+';
          } else if (ctrl.number < (0 - valueThreshold)) {
            ctrl.globalMove = '-';
          }

          ctrl.tickMove = '=';

          if (changes && !changes.number.isFirstChange()) {
            if (changes.number.currentValue > changes.number.previousValue +
              valueThreshold) {
              //            console.log('ticking up : ' + ctrl.number);
              ctrl.tickMove = '+';

            } else if (changes.number.currentValue < changes.number.previousValue -
              valueThreshold) {
              //            console.log('ticking down : ' + ctrl.number);
              ctrl.tickMove = '-';
            }
          }

          ctrl.numberShown = $filter('currency')(ctrl.number, '', ctrl.decimals);
        },
        ctrl.onclick = function(e) {
          if (ctrl.editable) {
            ctrl.isEdited = true;
            ctrl.editValue = "" + ctrl.number;
          }
        },
        ctrl.onchange = function(e) {
          if (e.charCode == 13) {
            ctrl.isEdited = false;
            ctrl.number = Number.parseFloat(ctrl.editValue.replace(",", "."));
            if (ctrl.onEdit) {
              ctrl.onEdit({
                'value': Number.parseFloat(ctrl.editValue.replace(",",
                  "."))
              });
            }
          }
        }
    },
    bindings: {
      editable: '<',
      currency: '<',
      number: '<',
      decimals: '<',
      symbol: '<',
      onEdit: '&'
    }
  });
