
/*
Requires https://godoc.org/golang.org/x/tools/cmd/goimports
 */

(function() {
  "use strict";
  var Beautifier, Goimports,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Goimports = (function(superClass) {
    extend(Goimports, superClass);

    function Goimports() {
      return Goimports.__super__.constructor.apply(this, arguments);
    }

    Goimports.prototype.name = "goimports";

    Goimports.prototype.link = "https://godoc.org/golang.org/x/tools/cmd/goimports";

    Goimports.prototype.executables = [
      {
        name: "goimports",
        cmd: "goimports",
        homepage: "https://godoc.org/golang.org/x/tools/cmd/goimports",
        installation: "https://godoc.org/golang.org/x/tools/cmd/goimports",
        version: {
          args: ['--help'],
          parse: function(text) {
            return text.indexOf("usage: goimports") !== -1 && "0.0.0";
          },
          runOptions: {
            ignoreReturnCode: true,
            returnStderr: true
          }
        },
        docker: {
          image: "unibeautify/goimports"
        }
      }
    ];

    Goimports.prototype.options = {
      Go: false
    };

    Goimports.prototype.beautify = function(text, language, options) {
      return this.exe("goimports").run([this.tempFile("input", text)]);
    };

    return Goimports;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2dvaW1wb3J0cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEscUJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3dCQUNyQixJQUFBLEdBQU07O3dCQUNOLElBQUEsR0FBTTs7d0JBQ04sV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sV0FEUjtRQUVFLEdBQUEsRUFBSyxXQUZQO1FBR0UsUUFBQSxFQUFVLG9EQUhaO1FBSUUsWUFBQSxFQUFjLG9EQUpoQjtRQUtFLE9BQUEsRUFBUztVQUVQLElBQUEsRUFBTSxDQUFDLFFBQUQsQ0FGQztVQUdQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxrQkFBYixDQUFBLEtBQXNDLENBQUMsQ0FBdkMsSUFBNkM7VUFBdkQsQ0FIQTtVQUlQLFVBQUEsRUFBWTtZQUNWLGdCQUFBLEVBQWtCLElBRFI7WUFFVixZQUFBLEVBQWMsSUFGSjtXQUpMO1NBTFg7UUFjRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8sdUJBREQ7U0FkVjtPQURXOzs7d0JBcUJiLE9BQUEsR0FBUztNQUNQLEVBQUEsRUFBSSxLQURHOzs7d0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLFdBQUwsQ0FBaUIsQ0FBQyxHQUFsQixDQUFzQixDQUNwQixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FEb0IsQ0FBdEI7SUFEUTs7OztLQTVCNkI7QUFQekMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ29kb2Mub3JnL2dvbGFuZy5vcmcveC90b29scy9jbWQvZ29pbXBvcnRzXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEdvaW1wb3J0cyBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJnb2ltcG9ydHNcIlxuICBsaW5rOiBcImh0dHBzOi8vZ29kb2Mub3JnL2dvbGFuZy5vcmcveC90b29scy9jbWQvZ29pbXBvcnRzXCJcbiAgZXhlY3V0YWJsZXM6IFtcbiAgICB7XG4gICAgICBuYW1lOiBcImdvaW1wb3J0c1wiXG4gICAgICBjbWQ6IFwiZ29pbXBvcnRzXCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ29kb2Mub3JnL2dvbGFuZy5vcmcveC90b29scy9jbWQvZ29pbXBvcnRzXCJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2dvZG9jLm9yZy9nb2xhbmcub3JnL3gvdG9vbHMvY21kL2dvaW1wb3J0c1wiXG4gICAgICB2ZXJzaW9uOiB7XG4gICAgICAgICMgRG9lcyBub3QgZGlzcGxheSB2ZXJzaW9uXG4gICAgICAgIGFyZ3M6IFsnLS1oZWxwJ10sXG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5pbmRleE9mKFwidXNhZ2U6IGdvaW1wb3J0c1wiKSBpc250IC0xIGFuZCBcIjAuMC4wXCIsXG4gICAgICAgIHJ1bk9wdGlvbnM6IHtcbiAgICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlLFxuICAgICAgICAgIHJldHVyblN0ZGVycjogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkb2NrZXI6IHtcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvZ29pbXBvcnRzXCJcbiAgICAgIH1cbiAgICB9XG4gIF1cblxuICBvcHRpb25zOiB7XG4gICAgR286IGZhbHNlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBleGUoXCJnb2ltcG9ydHNcIikucnVuKFtcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdKVxuIl19
