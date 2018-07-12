
/*
Requires [gn](https://chromium.googlesource.com/chromium/src/tools/gn)
 */

(function() {
  "use strict";
  var Beautifier, GN, path, semver,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  semver = require('semver');

  module.exports = GN = (function(superClass) {
    extend(GN, superClass);

    function GN() {
      return GN.__super__.constructor.apply(this, arguments);
    }

    GN.prototype.name = "GN";

    GN.prototype.link = "https://chromium.googlesource.com/chromium/src/tools/gn";

    GN.prototype.executables = [
      {
        name: "gn",
        cmd: "gn",
        homepage: "https://chromium.googlesource.com/chromium/src/tools/gn",
        installation: "https://www.chromium.org/developers/how-tos/get-the-code",
        version: {
          parse: function(text) {
            return semver.clean("0.0." + text);
          }
        }
      }
    ];

    GN.prototype.options = {
      GN: false
    };

    GN.prototype.beautify = function(text, language, options, context) {
      var cwd;
      cwd = context.filePath && path.dirname(context.filePath);
      return this.exe("gn").run(["format", "--stdin"], {
        cwd: cwd,
        onStdin: function(stdin) {
          return stdin.end(text);
        }
      });
    };

    return GN;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2duLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUdBO0FBSEEsTUFBQSw0QkFBQTtJQUFBOzs7RUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztpQkFDckIsSUFBQSxHQUFNOztpQkFDTixJQUFBLEdBQU07O2lCQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLElBRFI7UUFFRSxHQUFBLEVBQUssSUFGUDtRQUdFLFFBQUEsRUFBVSx5REFIWjtRQUlFLFlBQUEsRUFBYywwREFKaEI7UUFLRSxPQUFBLEVBQVM7VUFDUCxLQUFBLEVBQU8sU0FBQyxJQUFEO21CQUFVLE1BQU0sQ0FBQyxLQUFQLENBQWEsTUFBQSxHQUFTLElBQXRCO1VBQVYsQ0FEQTtTQUxYO09BRFc7OztpQkFZYixPQUFBLEdBQVM7TUFDUCxFQUFBLEVBQUksS0FERzs7O2lCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEVBQTBCLE9BQTFCO0FBQ1IsVUFBQTtNQUFBLEdBQUEsR0FBTSxPQUFPLENBQUMsUUFBUixJQUFxQixJQUFJLENBQUMsT0FBTCxDQUFhLE9BQU8sQ0FBQyxRQUFyQjthQUMzQixJQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsQ0FBVSxDQUFDLEdBQVgsQ0FBZSxDQUFDLFFBQUQsRUFBVyxTQUFYLENBQWYsRUFBc0M7UUFDcEMsR0FBQSxFQUFLLEdBRCtCO1FBRXBDLE9BQUEsRUFBUyxTQUFDLEtBQUQ7aUJBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWO1FBRE8sQ0FGMkI7T0FBdEM7SUFGUTs7OztLQW5Cc0I7QUFSbEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIFtnbl0oaHR0cHM6Ly9jaHJvbWl1bS5nb29nbGVzb3VyY2UuY29tL2Nocm9taXVtL3NyYy90b29scy9nbilcbiMjI1xuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBHTiBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJHTlwiXG4gIGxpbms6IFwiaHR0cHM6Ly9jaHJvbWl1bS5nb29nbGVzb3VyY2UuY29tL2Nocm9taXVtL3NyYy90b29scy9nblwiXG4gIGV4ZWN1dGFibGVzOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJnblwiXG4gICAgICBjbWQ6IFwiZ25cIlxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cHM6Ly9jaHJvbWl1bS5nb29nbGVzb3VyY2UuY29tL2Nocm9taXVtL3NyYy90b29scy9nblwiXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cHM6Ly93d3cuY2hyb21pdW0ub3JnL2RldmVsb3BlcnMvaG93LXRvcy9nZXQtdGhlLWNvZGVcIlxuICAgICAgdmVyc2lvbjoge1xuICAgICAgICBwYXJzZTogKHRleHQpIC0+IHNlbXZlci5jbGVhbihcIjAuMC5cIiArIHRleHQpXG4gICAgICB9XG4gICAgfVxuICBdXG5cbiAgb3B0aW9uczoge1xuICAgIEdOOiBmYWxzZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucywgY29udGV4dCkgLT5cbiAgICBjd2QgPSBjb250ZXh0LmZpbGVQYXRoIGFuZCBwYXRoLmRpcm5hbWUgY29udGV4dC5maWxlUGF0aFxuICAgIEBleGUoXCJnblwiKS5ydW4oW1wiZm9ybWF0XCIsIFwiLS1zdGRpblwiXSwge1xuICAgICAgY3dkOiBjd2RcbiAgICAgIG9uU3RkaW46IChzdGRpbikgLT5cbiAgICAgICAgc3RkaW4uZW5kIHRleHRcbiAgICB9KVxuIl19
