(function() {
  "use strict";
  var Beautifier, Cljfmt, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require('path');

  Beautifier = require('../beautifier');

  module.exports = Cljfmt = (function(superClass) {
    extend(Cljfmt, superClass);

    function Cljfmt() {
      return Cljfmt.__super__.constructor.apply(this, arguments);
    }

    Cljfmt.prototype.name = "cljfmt";

    Cljfmt.prototype.link = "https://github.com/snoe/node-cljfmt";

    Cljfmt.prototype.options = {
      Clojure: false
    };

    Cljfmt.prototype.beautify = function(text, language, options) {
      var cljfmt, formatPath;
      formatPath = path.resolve(__dirname, "fmt.edn");
      cljfmt = path.resolve(__dirname, "..", "..", "..", "node_modules/.bin/cljfmt");
      return this.tempFile("input", text).then((function(_this) {
        return function(filePath) {
          return _this.run(cljfmt, [filePath, "--edn=" + formatPath]).then(function() {
            return _this.readFile(filePath);
          });
        };
      })(this));
    };

    return Cljfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2NsamZtdC9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEsd0JBQUE7SUFBQTs7O0VBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztxQkFFckIsSUFBQSxHQUFNOztxQkFDTixJQUFBLEdBQU07O3FCQUVOLE9BQUEsR0FBUztNQUNQLE9BQUEsRUFBUyxLQURGOzs7cUJBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixTQUF4QjtNQUNiLE1BQUEsR0FBUyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsSUFBeEIsRUFBOEIsSUFBOUIsRUFBb0MsSUFBcEMsRUFBMEMsMEJBQTFDO2FBQ1QsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFFBQUQ7aUJBQzVCLEtBQUMsQ0FBQSxHQUFELENBQUssTUFBTCxFQUFhLENBQ1gsUUFEVyxFQUVYLFFBQUEsR0FBVyxVQUZBLENBQWIsQ0FHRSxDQUFDLElBSEgsQ0FHUSxTQUFBO21CQUNOLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURNLENBSFI7UUFENEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO0lBSFE7Ozs7S0FUMEI7QUFKdEMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4uL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIENsamZtdCBleHRlbmRzIEJlYXV0aWZpZXJcblxuICBuYW1lOiBcImNsamZtdFwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3Nub2Uvbm9kZS1jbGpmbXRcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBDbG9qdXJlOiBmYWxzZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBmb3JtYXRQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJmbXQuZWRuXCIpXG4gICAgY2xqZm10ID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLlwiLCBcIi4uXCIsIFwiLi5cIiwgXCJub2RlX21vZHVsZXMvLmJpbi9jbGpmbXRcIilcbiAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KS50aGVuKChmaWxlUGF0aCkgPT5cbiAgICAgIEBydW4oY2xqZm10LCBbXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICBcIi0tZWRuPVwiICsgZm9ybWF0UGF0aFxuICAgICAgXSkudGhlbig9PlxuICAgICAgICBAcmVhZEZpbGUoZmlsZVBhdGgpKSlcbiJdfQ==
