
/*
Requires https://github.com/bbatsov/rubocop
 */

(function() {
  "use strict";
  var Beautifier, Rubocop, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  module.exports = Rubocop = (function(superClass) {
    extend(Rubocop, superClass);

    function Rubocop() {
      return Rubocop.__super__.constructor.apply(this, arguments);
    }

    Rubocop.prototype.name = "Rubocop";

    Rubocop.prototype.link = "https://github.com/bbatsov/rubocop";

    Rubocop.prototype.isPreInstalled = false;

    Rubocop.prototype.options = {
      Ruby: {
        indent_size: true,
        rubocop_path: true
      }
    };

    Rubocop.prototype.executables = [
      {
        name: "Rubocop",
        cmd: "rubocop",
        homepage: "http://rubocop.readthedocs.io/",
        installation: "http://rubocop.readthedocs.io/en/latest/installation/",
        version: {
          parse: function(text) {
            return text.match(/(\d+\.\d+\.\d+)/)[1];
          }
        }
      }
    ];

    Rubocop.prototype.beautify = function(text, language, options, context) {
      var _relativePath, fullPath, projectPath, ref;
      fullPath = context.filePath || "";
      ref = atom.project.relativizePath(fullPath), projectPath = ref[0], _relativePath = ref[1];
      if (options.rubocop_path) {
        this.deprecateOptionForExecutable("Rubocop", "Ruby - Rubocop Path (rubocop_path)", "Path");
      }
      return this.Promise.all([options.rubocop_path ? this.which(options.rubocop_path) : void 0, this.which('rubocop')]).then((function(_this) {
        return function(paths) {
          var config, configFile, exeOptions, rubocopArguments, rubocopPath, tempConfig, yaml;
          _this.debug('rubocop paths', paths);
          rubocopPath = paths.find(function(p) {
            return p && path.isAbsolute(p);
          }) || "rubocop";
          _this.verbose('rubocopPath', rubocopPath);
          _this.debug('rubocopPath', rubocopPath, paths);
          configFile = _this.findFile(path.dirname(fullPath), ".rubocop.yml");
          if (configFile == null) {
            yaml = require("yaml-front-matter");
            config = {
              "Style/IndentationWidth": {
                "Width": options.indent_size
              }
            };
            tempConfig = _this.tempFile("rubocop-config", yaml.safeDump(config));
          }
          rubocopArguments = ["--auto-correct", "--force-exclusion", "--stdin", "atom-beautify.rb"];
          exeOptions = {
            ignoreReturnCode: true,
            cwd: configFile != null ? projectPath : void 0,
            onStdin: function(stdin) {
              return stdin.end(text);
            }
          };
          if (tempConfig != null) {
            rubocopArguments.push("--config", tempConfig);
          }
          _this.debug("rubocop arguments", rubocopArguments);
          return (options.rubocop_path ? _this.run(rubocopPath, rubocopArguments, exeOptions) : _this.exe("rubocop").run(rubocopArguments, exeOptions)).then(function(stdout) {
            var result;
            _this.debug("rubocop output", stdout);
            if (stdout.length === 0) {
              return text;
            }
            result = stdout.split("====================\n");
            return result[result.length - 1];
          });
        };
      })(this));
    };

    return Rubocop;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3J1Ym9jb3AuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLHlCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7c0JBQ3JCLElBQUEsR0FBTTs7c0JBQ04sSUFBQSxHQUFNOztzQkFDTixjQUFBLEdBQWdCOztzQkFFaEIsT0FBQSxHQUFTO01BQ1AsSUFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLElBQWI7UUFDQSxZQUFBLEVBQWMsSUFEZDtPQUZLOzs7c0JBTVQsV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sU0FEUjtRQUVFLEdBQUEsRUFBSyxTQUZQO1FBR0UsUUFBQSxFQUFVLGdDQUhaO1FBSUUsWUFBQSxFQUFjLHVEQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxpQkFBWCxDQUE4QixDQUFBLENBQUE7VUFBeEMsQ0FEQTtTQUxYO09BRFc7OztzQkFZYixRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixFQUEwQixPQUExQjtBQUNSLFVBQUE7TUFBQSxRQUFBLEdBQVcsT0FBTyxDQUFDLFFBQVIsSUFBb0I7TUFDL0IsTUFBK0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLFFBQTVCLENBQS9CLEVBQUMsb0JBQUQsRUFBYztNQUdkLElBQUcsT0FBTyxDQUFDLFlBQVg7UUFDRSxJQUFDLENBQUEsNEJBQUQsQ0FBOEIsU0FBOUIsRUFBeUMsb0NBQXpDLEVBQStFLE1BQS9FLEVBREY7O2FBSUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsQ0FDcUIsT0FBTyxDQUFDLFlBQXhDLEdBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxPQUFPLENBQUMsWUFBZixDQUFBLEdBQUEsTUFEVyxFQUVYLElBQUMsQ0FBQSxLQUFELENBQU8sU0FBUCxDQUZXLENBQWIsQ0FJQSxDQUFDLElBSkQsQ0FJTSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNKLGNBQUE7VUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGVBQVAsRUFBd0IsS0FBeEI7VUFFQSxXQUFBLEdBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFDLENBQUQ7bUJBQU8sQ0FBQSxJQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLENBQWhCO1VBQWIsQ0FBWCxDQUFBLElBQStDO1VBQzdELEtBQUMsQ0FBQSxPQUFELENBQVMsYUFBVCxFQUF3QixXQUF4QjtVQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sYUFBUCxFQUFzQixXQUF0QixFQUFtQyxLQUFuQztVQUdBLFVBQUEsR0FBYSxLQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFWLEVBQWtDLGNBQWxDO1VBQ2IsSUFBSSxrQkFBSjtZQUNFLElBQUEsR0FBTyxPQUFBLENBQVEsbUJBQVI7WUFDUCxNQUFBLEdBQVM7Y0FDUCx3QkFBQSxFQUNFO2dCQUFBLE9BQUEsRUFBUyxPQUFPLENBQUMsV0FBakI7ZUFGSzs7WUFJVCxVQUFBLEdBQWEsS0FBQyxDQUFBLFFBQUQsQ0FBVSxnQkFBVixFQUE0QixJQUFJLENBQUMsUUFBTCxDQUFjLE1BQWQsQ0FBNUIsRUFOZjs7VUFRQSxnQkFBQSxHQUFtQixDQUNqQixnQkFEaUIsRUFFakIsbUJBRmlCLEVBR2pCLFNBSGlCLEVBR04sa0JBSE07VUFLbkIsVUFBQSxHQUFhO1lBQ1gsZ0JBQUEsRUFBa0IsSUFEUDtZQUVYLEdBQUEsRUFBb0Isa0JBQWYsR0FBQSxXQUFBLEdBQUEsTUFGTTtZQUdYLE9BQUEsRUFBUyxTQUFDLEtBQUQ7cUJBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWO1lBQVgsQ0FIRTs7VUFLYixJQUFpRCxrQkFBakQ7WUFBQSxnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQixVQUF0QixFQUFrQyxVQUFsQyxFQUFBOztVQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sbUJBQVAsRUFBNEIsZ0JBQTVCO2lCQUVBLENBQUksT0FBTyxDQUFDLFlBQVgsR0FDQyxLQUFDLENBQUEsR0FBRCxDQUFLLFdBQUwsRUFBa0IsZ0JBQWxCLEVBQW9DLFVBQXBDLENBREQsR0FFQyxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsQ0FBZSxDQUFDLEdBQWhCLENBQW9CLGdCQUFwQixFQUFzQyxVQUF0QyxDQUZGLENBR0MsQ0FBQyxJQUhGLENBR08sU0FBQyxNQUFEO0FBQ0wsZ0JBQUE7WUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGdCQUFQLEVBQXlCLE1BQXpCO1lBRUEsSUFBZSxNQUFNLENBQUMsTUFBUCxLQUFpQixDQUFoQztBQUFBLHFCQUFPLEtBQVA7O1lBRUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxLQUFQLENBQWEsd0JBQWI7bUJBQ1QsTUFBTyxDQUFBLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQWhCO1VBTkYsQ0FIUDtRQTlCSTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKTjtJQVRROzs7O0tBdkIyQjtBQVJ2QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL2JiYXRzb3YvcnVib2NvcFxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSdWJvY29wIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlJ1Ym9jb3BcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iYmF0c292L3J1Ym9jb3BcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgUnVieTpcbiAgICAgIGluZGVudF9zaXplOiB0cnVlXG4gICAgICBydWJvY29wX3BhdGg6IHRydWVcbiAgfVxuXG4gIGV4ZWN1dGFibGVzOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJSdWJvY29wXCJcbiAgICAgIGNtZDogXCJydWJvY29wXCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHA6Ly9ydWJvY29wLnJlYWR0aGVkb2NzLmlvL1wiXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cDovL3J1Ym9jb3AucmVhZHRoZWRvY3MuaW8vZW4vbGF0ZXN0L2luc3RhbGxhdGlvbi9cIlxuICAgICAgdmVyc2lvbjoge1xuICAgICAgICBwYXJzZTogKHRleHQpIC0+IHRleHQubWF0Y2goLyhcXGQrXFwuXFxkK1xcLlxcZCspLylbMV1cbiAgICAgIH1cbiAgICB9XG4gIF1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0KSAtPlxuICAgIGZ1bGxQYXRoID0gY29udGV4dC5maWxlUGF0aCBvciBcIlwiXG4gICAgW3Byb2plY3RQYXRoLCBfcmVsYXRpdmVQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmdWxsUGF0aClcblxuICAgICMgRGVwcmVjYXRlIG9wdGlvbnMucnVib2NvcF9wYXRoXG4gICAgaWYgb3B0aW9ucy5ydWJvY29wX3BhdGhcbiAgICAgIEBkZXByZWNhdGVPcHRpb25Gb3JFeGVjdXRhYmxlKFwiUnVib2NvcFwiLCBcIlJ1YnkgLSBSdWJvY29wIFBhdGggKHJ1Ym9jb3BfcGF0aClcIiwgXCJQYXRoXCIpXG5cbiAgICAjIEZpbmQgdGhlIHJ1Ym9jb3AgcGF0aFxuICAgIEBQcm9taXNlLmFsbChbXG4gICAgICBAd2hpY2gob3B0aW9ucy5ydWJvY29wX3BhdGgpIGlmIG9wdGlvbnMucnVib2NvcF9wYXRoXG4gICAgICBAd2hpY2goJ3J1Ym9jb3AnKVxuICAgIF0pXG4gICAgLnRoZW4oKHBhdGhzKSA9PlxuICAgICAgQGRlYnVnKCdydWJvY29wIHBhdGhzJywgcGF0aHMpXG4gICAgICAjIEdldCBmaXJzdCB2YWxpZCwgYWJzb2x1dGUgcGF0aFxuICAgICAgcnVib2NvcFBhdGggPSBwYXRocy5maW5kKChwKSAtPiBwIGFuZCBwYXRoLmlzQWJzb2x1dGUocCkpIG9yIFwicnVib2NvcFwiXG4gICAgICBAdmVyYm9zZSgncnVib2NvcFBhdGgnLCBydWJvY29wUGF0aClcbiAgICAgIEBkZWJ1ZygncnVib2NvcFBhdGgnLCBydWJvY29wUGF0aCwgcGF0aHMpXG5cbiAgICAgICMgRmluZCBvciBnZW5lcmF0ZSBhIGNvbmZpZyBmaWxlIGlmIG5vbiBleGlzdHNcbiAgICAgIGNvbmZpZ0ZpbGUgPSBAZmluZEZpbGUocGF0aC5kaXJuYW1lKGZ1bGxQYXRoKSwgXCIucnVib2NvcC55bWxcIilcbiAgICAgIGlmICFjb25maWdGaWxlP1xuICAgICAgICB5YW1sID0gcmVxdWlyZShcInlhbWwtZnJvbnQtbWF0dGVyXCIpXG4gICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICBcIlN0eWxlL0luZGVudGF0aW9uV2lkdGhcIjpcbiAgICAgICAgICAgIFwiV2lkdGhcIjogb3B0aW9ucy5pbmRlbnRfc2l6ZVxuICAgICAgICB9XG4gICAgICAgIHRlbXBDb25maWcgPSBAdGVtcEZpbGUoXCJydWJvY29wLWNvbmZpZ1wiLCB5YW1sLnNhZmVEdW1wKGNvbmZpZykpXG5cbiAgICAgIHJ1Ym9jb3BBcmd1bWVudHMgPSBbXG4gICAgICAgIFwiLS1hdXRvLWNvcnJlY3RcIlxuICAgICAgICBcIi0tZm9yY2UtZXhjbHVzaW9uXCJcbiAgICAgICAgXCItLXN0ZGluXCIsIFwiYXRvbS1iZWF1dGlmeS5yYlwiICMgZmlsZW5hbWUgaXMgcmVxdWlyZWQgYnV0IG5vdCB1c2VkXG4gICAgICBdXG4gICAgICBleGVPcHRpb25zID0ge1xuICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlLFxuICAgICAgICBjd2Q6IHByb2plY3RQYXRoIGlmIGNvbmZpZ0ZpbGU/LFxuICAgICAgICBvblN0ZGluOiAoc3RkaW4pIC0+IHN0ZGluLmVuZCB0ZXh0XG4gICAgICB9XG4gICAgICBydWJvY29wQXJndW1lbnRzLnB1c2goXCItLWNvbmZpZ1wiLCB0ZW1wQ29uZmlnKSBpZiB0ZW1wQ29uZmlnP1xuICAgICAgQGRlYnVnKFwicnVib2NvcCBhcmd1bWVudHNcIiwgcnVib2NvcEFyZ3VtZW50cylcblxuICAgICAgKGlmIG9wdGlvbnMucnVib2NvcF9wYXRoIHRoZW4gXFxcbiAgICAgICAgQHJ1bihydWJvY29wUGF0aCwgcnVib2NvcEFyZ3VtZW50cywgZXhlT3B0aW9ucykgZWxzZSBcXFxuICAgICAgICBAZXhlKFwicnVib2NvcFwiKS5ydW4ocnVib2NvcEFyZ3VtZW50cywgZXhlT3B0aW9ucylcbiAgICAgICkudGhlbigoc3Rkb3V0KSA9PlxuICAgICAgICBAZGVidWcoXCJydWJvY29wIG91dHB1dFwiLCBzdGRvdXQpXG4gICAgICAgICMgUnVib2NvcCBvdXRwdXQgYW4gZXJyb3IgaWYgc3Rkb3V0IGlzIGVtcHR5XG4gICAgICAgIHJldHVybiB0ZXh0IGlmIHN0ZG91dC5sZW5ndGggPT0gMFxuXG4gICAgICAgIHJlc3VsdCA9IHN0ZG91dC5zcGxpdChcIj09PT09PT09PT09PT09PT09PT09XFxuXCIpXG4gICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV1cbiAgICAgIClcbiAgICApXG4iXX0=
