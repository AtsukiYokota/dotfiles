
/*
Requires https://github.com/avh4/elm-format
 */

(function() {
  "use strict";
  var Beautifier, ElmFormat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = ElmFormat = (function(superClass) {
    extend(ElmFormat, superClass);

    function ElmFormat() {
      return ElmFormat.__super__.constructor.apply(this, arguments);
    }

    ElmFormat.prototype.name = "elm-format";

    ElmFormat.prototype.link = "https://github.com/avh4/elm-format";

    ElmFormat.prototype.executables = [
      {
        name: "elm-format",
        cmd: "elm-format",
        homepage: "https://github.com/avh4/elm-format",
        installation: "https://github.com/avh4/elm-format#installation-",
        version: {
          args: ['--help'],
          parse: function(text) {
            try {
              return text.match(/elm-format-\d+.\d+ (\d+\.\d+\.\d+)/)[1];
            } catch (error) {
              return text.match(/elm-format (\d+\.\d+\.\d+)/)[1];
            }
          }
        },
        docker: {
          image: "unibeautify/elm-format"
        }
      }
    ];

    ElmFormat.prototype.options = {
      Elm: true
    };

    ElmFormat.prototype.beautify = function(text, language, options) {
      var tempfile;
      return tempfile = this.tempFile("input", text, ".elm").then((function(_this) {
        return function(name) {
          return _this.exe("elm-format").run(['--yes', name]).then(function() {
            return _this.readFile(name);
          });
        };
      })(this));
    };

    return ElmFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2VsbS1mb3JtYXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBR0E7QUFIQSxNQUFBLHFCQUFBO0lBQUE7OztFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFDckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLFlBRFI7UUFFRSxHQUFBLEVBQUssWUFGUDtRQUdFLFFBQUEsRUFBVSxvQ0FIWjtRQUlFLFlBQUEsRUFBYyxrREFKaEI7UUFLRSxPQUFBLEVBQVM7VUFDUCxJQUFBLEVBQU0sQ0FBQyxRQUFELENBREM7VUFFUCxLQUFBLEVBQU8sU0FBQyxJQUFEO0FBQ0w7QUFDRSxxQkFBTyxJQUFJLENBQUMsS0FBTCxDQUFXLG9DQUFYLENBQWlELENBQUEsQ0FBQSxFQUQxRDthQUFBLGFBQUE7QUFHRSxxQkFBTyxJQUFJLENBQUMsS0FBTCxDQUFXLDRCQUFYLENBQXlDLENBQUEsQ0FBQSxFQUhsRDs7VUFESyxDQUZBO1NBTFg7UUFhRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8sd0JBREQ7U0FiVjtPQURXOzs7d0JBb0JiLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFBSyxJQURFOzs7d0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO2FBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixFQUF5QixNQUF6QixDQUNYLENBQUMsSUFEVSxDQUNMLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO2lCQUNKLEtBQUMsQ0FBQSxHQUFELENBQUssWUFBTCxDQUNFLENBQUMsR0FESCxDQUNPLENBQ0gsT0FERyxFQUVILElBRkcsQ0FEUCxDQUtFLENBQUMsSUFMSCxDQUtRLFNBQUE7bUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWO1VBREksQ0FMUjtRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURLO0lBREg7Ozs7S0EzQjZCO0FBTnpDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vYXZoNC9lbG0tZm9ybWF0XG4jIyNcblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBFbG1Gb3JtYXQgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiZWxtLWZvcm1hdFwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2F2aDQvZWxtLWZvcm1hdFwiXG4gIGV4ZWN1dGFibGVzOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJlbG0tZm9ybWF0XCJcbiAgICAgIGNtZDogXCJlbG0tZm9ybWF0XCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9hdmg0L2VsbS1mb3JtYXRcIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9hdmg0L2VsbS1mb3JtYXQjaW5zdGFsbGF0aW9uLVwiXG4gICAgICB2ZXJzaW9uOiB7XG4gICAgICAgIGFyZ3M6IFsnLS1oZWxwJ11cbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPlxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgcmV0dXJuIHRleHQubWF0Y2goL2VsbS1mb3JtYXQtXFxkKy5cXGQrIChcXGQrXFwuXFxkK1xcLlxcZCspLylbMV1cbiAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgcmV0dXJuIHRleHQubWF0Y2goL2VsbS1mb3JtYXQgKFxcZCtcXC5cXGQrXFwuXFxkKykvKVsxXVxuICAgICAgfVxuICAgICAgZG9ja2VyOiB7XG4gICAgICAgIGltYWdlOiBcInVuaWJlYXV0aWZ5L2VsbS1mb3JtYXRcIlxuICAgICAgfVxuICAgIH1cbiAgXVxuXG4gIG9wdGlvbnM6IHtcbiAgICBFbG06IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgdGVtcGZpbGUgPSBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0LCBcIi5lbG1cIilcbiAgICAudGhlbiAobmFtZSkgPT5cbiAgICAgIEBleGUoXCJlbG0tZm9ybWF0XCIpXG4gICAgICAgIC5ydW4oW1xuICAgICAgICAgICctLXllcycsXG4gICAgICAgICAgbmFtZVxuICAgICAgICBdKVxuICAgICAgICAudGhlbiAoKSA9PlxuICAgICAgICAgIEByZWFkRmlsZShuYW1lKVxuIl19
