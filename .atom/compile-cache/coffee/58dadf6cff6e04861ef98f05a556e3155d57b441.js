
/*
Requires https://github.com/threedaymonk/htmlbeautifier
 */

(function() {
  "use strict";
  var Beautifier, HTMLBeautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = HTMLBeautifier = (function(superClass) {
    extend(HTMLBeautifier, superClass);

    function HTMLBeautifier() {
      return HTMLBeautifier.__super__.constructor.apply(this, arguments);
    }

    HTMLBeautifier.prototype.name = "HTML Beautifier";

    HTMLBeautifier.prototype.link = "https://github.com/threedaymonk/htmlbeautifier";

    HTMLBeautifier.prototype.isPreInstalled = false;

    HTMLBeautifier.prototype.options = {
      ERB: {
        indent_size: true
      }
    };

    HTMLBeautifier.prototype.beautify = function(text, language, options) {
      var tempFile;
      console.log('erb', options);
      return this.run("htmlbeautifier", ["--tab-stops", options.indent_size, tempFile = this.tempFile("temp", text)]).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return HTMLBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2h0bWxiZWF1dGlmaWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSwwQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7NkJBQ3JCLElBQUEsR0FBTTs7NkJBQ04sSUFBQSxHQUFNOzs2QkFDTixjQUFBLEdBQWdCOzs2QkFFaEIsT0FBQSxHQUFTO01BQ1AsR0FBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLElBQWI7T0FGSzs7OzZCQUtULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWixFQUFtQixPQUFuQjthQUNBLElBQUMsQ0FBQSxHQUFELENBQUssZ0JBQUwsRUFBdUIsQ0FDckIsYUFEcUIsRUFDTixPQUFPLENBQUMsV0FERixFQUVyQixRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBRlUsQ0FBdkIsQ0FJRSxDQUFDLElBSkgsQ0FJUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1FBREk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSlI7SUFGUTs7OztLQVZrQztBQVA5QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL3RocmVlZGF5bW9uay9odG1sYmVhdXRpZmllclxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIVE1MQmVhdXRpZmllciBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJIVE1MIEJlYXV0aWZpZXJcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS90aHJlZWRheW1vbmsvaHRtbGJlYXV0aWZpZXJcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgRVJCOlxuICAgICAgaW5kZW50X3NpemU6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgY29uc29sZS5sb2coJ2VyYicsIG9wdGlvbnMpXG4gICAgQHJ1bihcImh0bWxiZWF1dGlmaWVyXCIsIFtcbiAgICAgIFwiLS10YWItc3RvcHNcIiwgb3B0aW9ucy5pbmRlbnRfc2l6ZVxuICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICBdKVxuICAgICAgLnRoZW4oPT5cbiAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgKVxuIl19
