
/*
Requires [formatR](https://github.com/yihui/formatR)
 */

(function() {
  var Beautifier, R, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  module.exports = R = (function(superClass) {
    extend(R, superClass);

    function R() {
      return R.__super__.constructor.apply(this, arguments);
    }

    R.prototype.name = "formatR";

    R.prototype.link = "https://github.com/yihui/formatR";

    R.prototype.executables = [
      {
        name: "Rscript",
        cmd: "rscript",
        homepage: "https://github.com/yihui/formatR",
        installation: "https://github.com/yihui/formatR",
        version: {
          parse: function(text) {
            return text.match(/version (\d+\.\d+\.\d+) /)[1];
          },
          runOptions: {
            returnStderr: true
          }
        },
        docker: {
          image: "unibeautify/rscript"
        }
      }
    ];

    R.prototype.options = {
      R: true
    };

    R.prototype.beautify = function(text, language, options) {
      var r_beautifier, rscript;
      rscript = this.exe("rscript");
      r_beautifier = path.resolve(__dirname, "formatR.r");
      return rscript.run([r_beautifier, options.indent_size, this.tempFile("input", text)]);
    };

    return R;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2Zvcm1hdFIvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0FBQUEsTUFBQSxtQkFBQTtJQUFBOzs7RUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVA7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O2dCQUNyQixJQUFBLEdBQU07O2dCQUNOLElBQUEsR0FBTTs7Z0JBQ04sV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sU0FEUjtRQUVFLEdBQUEsRUFBSyxTQUZQO1FBR0UsUUFBQSxFQUFVLGtDQUhaO1FBSUUsWUFBQSxFQUFjLGtDQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVywwQkFBWCxDQUF1QyxDQUFBLENBQUE7VUFBakQsQ0FEQTtVQUVQLFVBQUEsRUFBWTtZQUNWLFlBQUEsRUFBYyxJQURKO1dBRkw7U0FMWDtRQVdFLE1BQUEsRUFBUTtVQUNOLEtBQUEsRUFBTyxxQkFERDtTQVhWO09BRFc7OztnQkFrQmIsT0FBQSxHQUFTO01BQ1AsQ0FBQSxFQUFHLElBREk7OztnQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLEdBQUQsQ0FBSyxTQUFMO01BQ1YsWUFBQSxHQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixXQUF4QjthQUNmLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FDVixZQURVLEVBRVYsT0FBTyxDQUFDLFdBRkUsRUFHVixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FIVSxDQUFaO0lBSFE7Ozs7S0F6QnFCO0FBUmpDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBbZm9ybWF0Ul0oaHR0cHM6Ly9naXRodWIuY29tL3lpaHVpL2Zvcm1hdFIpXG4jIyNcbnBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4uL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFIgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiZm9ybWF0UlwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3lpaHVpL2Zvcm1hdFJcIlxuICBleGVjdXRhYmxlczogW1xuICAgIHtcbiAgICAgIG5hbWU6IFwiUnNjcmlwdFwiXG4gICAgICBjbWQ6IFwicnNjcmlwdFwiXG4gICAgICBob21lcGFnZTogXCJodHRwczovL2dpdGh1Yi5jb20veWlodWkvZm9ybWF0UlwiXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cHM6Ly9naXRodWIuY29tL3lpaHVpL2Zvcm1hdFJcIlxuICAgICAgdmVyc2lvbjoge1xuICAgICAgICBwYXJzZTogKHRleHQpIC0+IHRleHQubWF0Y2goL3ZlcnNpb24gKFxcZCtcXC5cXGQrXFwuXFxkKykgLylbMV1cbiAgICAgICAgcnVuT3B0aW9uczoge1xuICAgICAgICAgIHJldHVyblN0ZGVycjogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkb2NrZXI6IHtcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvcnNjcmlwdFwiXG4gICAgICB9XG4gICAgfVxuICBdXG5cbiAgb3B0aW9uczoge1xuICAgIFI6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgcnNjcmlwdCA9IEBleGUoXCJyc2NyaXB0XCIpXG4gICAgcl9iZWF1dGlmaWVyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJmb3JtYXRSLnJcIilcbiAgICByc2NyaXB0LnJ1bihbXG4gICAgICByX2JlYXV0aWZpZXIsXG4gICAgICBvcHRpb25zLmluZGVudF9zaXplLFxuICAgICAgQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dCksXG4gICAgXSlcbiJdfQ==
