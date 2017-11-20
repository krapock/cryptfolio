angular.module('coinBalanceApp')
  .factory('menu', function() {
    var menu = this;
    menu.baseImageData = null;
    menu.line1 = {
      text: "0000",
      color: "#000000",
      bgColor: "#ffba22"
    };
    menu.line2 = {
      text: "0000",
      color: "#eeeeee",
      bgColor: "#000000"
    };

    menu.updateLine1Val = function(value) {
      if (!isNaN(value)) {
        let absval = value > 0 ? value : 0 - value;
        menu.line1.text = menu.cleanVal(absval);
        menu.updateIcon();
      }
    }
    menu.updateLine1Perc = function(percentage) {
      if (!isNaN(percentage)) {
        menu.line1.text = menu.cleanPerc(percentage);
        menu.updateIcon();
      }
    }
    menu.updateLine2Val = function(value) {
      if (!isNaN(value)) {
        let absval = value > 0 ? value : 0 - value;
        menu.line2.text = menu.cleanVal(absval);
        menu.line2.bgColor = value > 0 ? '#060' : '#600';
        menu.updateIcon();
      }
    }
    menu.updateLine2Perc = function(percentage) {
      if (!isNaN(percentage)) {
        menu.line2.text = menu.cleanPerc(percentage);
        menu.line2.bgColor = percentage > 0 ? '#060' : '#600';
        menu.updateIcon();
      }
    }
    menu.cleanPerc = (value) => ('' + percentage).substr(0, 4);
    menu.cleanVal = (value) => {
      let absval = value > 0 ? value : 0 - value;
      if (absval < 1) {
        return ('' + value).substr(1, 5);
      } else if (absval < 100) {
        return ('' + value).substr(0, 4);
      } else if (absval < 1000) {
        return ('' + value).substr(0, 3);
      } else if (absval < 10000) {
        return ('' + value).substr(0, 4);
      } else {
        return ('' + value / 1000).substr(0, 3) + 'k';
      }
      return "?";
    }

    menu.updateTooltip = text => chrome.browserAction.setTitle({
      'title': text
    });

    menu.createBaseIconCanvas = () => {
      var c = document.createElement('canvas');
      var ctx = c.getContext('2d');
      var img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = function() {
        c.width = this.width;
        c.height = this.height;
        ctx.drawImage(this, 0, 0, c.width, c.height, 0, 0, 16, 16);
        // either you do use the image data
        menu.baseImageData = ctx.getImageData(0, 0, 16, 16);
      }

      img.src = "icon.png";
    }

    menu.writeIconLines = baseImageData => {
      var c = document.createElement('canvas');
      var ctx = c.getContext("2d");
      ctx.putImageData(baseImageData, 0, 0);

      ctx.font = "8px Tahoma";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      ctx.fillStyle = menu.line1.bgColor;
      ctx.fillRect(0, 0, 16, 8);
      ctx.fillStyle = menu.line1.color;
      ctx.fillText(menu.line1.text, 8, -1);

      ctx.fillStyle = menu.line2.bgColor;
      ctx.fillRect(0, 8, 16, 8);
      ctx.fillStyle = menu.line2.color;
      ctx.fillText(menu.line2.text, 8, 7);

      return ctx.getImageData(0, 0, 16, 16);
    }

    menu.updateIcon = () => {
      let icon = menu.baseImageData;
      icon = menu.writeIconLines(icon);
      chrome.browserAction.setIcon({
        'imageData': icon
      });
    }

    //bootstrap
    menu.createBaseIconCanvas();
    setTimeout(menu.updateIcon, 500);

    return menu;
  });
