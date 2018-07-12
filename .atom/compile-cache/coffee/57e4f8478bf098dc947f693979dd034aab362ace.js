
/*
Requires https://github.com/lspitzner/brittany
 */

(function() {
  "use strict";
  var Beautifier, Brittany,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Brittany = (function(superClass) {
    extend(Brittany, superClass);

    function Brittany() {
      return Brittany.__super__.constructor.apply(this, arguments);
    }

    Brittany.prototype.name = "brittany";

    Brittany.prototype.link = "https://github.com/lspitzner/brittany";

    Brittany.prototype.isPreInstalled = false;

    Brittany.prototype.options = {
      Haskell: false
    };

    Brittany.prototype.beautify = function(text, language, options) {
      return this.run("brittany", [this.tempFile("input", text)], {
        help: {
          link: "https://github.com/lspitzner/brittany"
        }
      });
    };

    return Brittany;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2JyaXR0YW55LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxvQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7dUJBQ3JCLElBQUEsR0FBTTs7dUJBQ04sSUFBQSxHQUFNOzt1QkFDTixjQUFBLEdBQWdCOzt1QkFFaEIsT0FBQSxHQUFTO01BQ1AsT0FBQSxFQUFTLEtBREY7Ozt1QkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxFQUFpQixDQUNmLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURlLENBQWpCLEVBRUs7UUFDRCxJQUFBLEVBQU07VUFDSixJQUFBLEVBQU0sdUNBREY7U0FETDtPQUZMO0lBRFE7Ozs7S0FUNEI7QUFQeEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9sc3BpdHpuZXIvYnJpdHRhbnlcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQnJpdHRhbnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiYnJpdHRhbnlcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9sc3BpdHpuZXIvYnJpdHRhbnlcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgSGFza2VsbDogZmFsc2VcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQHJ1bihcImJyaXR0YW55XCIsIFtcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdLCB7XG4gICAgICAgIGhlbHA6IHtcbiAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9sc3BpdHpuZXIvYnJpdHRhbnlcIlxuICAgICAgICB9XG4gICAgICB9KVxuIl19
