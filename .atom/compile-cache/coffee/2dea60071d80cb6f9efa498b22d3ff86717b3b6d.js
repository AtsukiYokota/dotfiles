
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
            if (result.length === 1) {
              result = stdout.split("====================\r\n");
            }
            return result[result.length - 1];
          });
        };
      })(this));
    };

    return Rubocop;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3J1Ym9jb3AuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLHlCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7c0JBQ3JCLElBQUEsR0FBTTs7c0JBQ04sSUFBQSxHQUFNOztzQkFDTixjQUFBLEdBQWdCOztzQkFFaEIsT0FBQSxHQUFTO01BQ1AsSUFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLElBQWI7UUFDQSxZQUFBLEVBQWMsSUFEZDtPQUZLOzs7c0JBTVQsV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sU0FEUjtRQUVFLEdBQUEsRUFBSyxTQUZQO1FBR0UsUUFBQSxFQUFVLGdDQUhaO1FBSUUsWUFBQSxFQUFjLHVEQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxpQkFBWCxDQUE4QixDQUFBLENBQUE7VUFBeEMsQ0FEQTtTQUxYO09BRFc7OztzQkFZYixRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixFQUEwQixPQUExQjtBQUNSLFVBQUE7TUFBQSxRQUFBLEdBQVcsT0FBTyxDQUFDLFFBQVIsSUFBb0I7TUFDL0IsTUFBK0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLFFBQTVCLENBQS9CLEVBQUMsb0JBQUQsRUFBYztNQUdkLElBQUcsT0FBTyxDQUFDLFlBQVg7UUFDRSxJQUFDLENBQUEsNEJBQUQsQ0FBOEIsU0FBOUIsRUFBeUMsb0NBQXpDLEVBQStFLE1BQS9FLEVBREY7O2FBSUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsQ0FDcUIsT0FBTyxDQUFDLFlBQXhDLEdBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxPQUFPLENBQUMsWUFBZixDQUFBLEdBQUEsTUFEVyxFQUVYLElBQUMsQ0FBQSxLQUFELENBQU8sU0FBUCxDQUZXLENBQWIsQ0FJQSxDQUFDLElBSkQsQ0FJTSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNKLGNBQUE7VUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGVBQVAsRUFBd0IsS0FBeEI7VUFFQSxXQUFBLEdBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFDLENBQUQ7bUJBQU8sQ0FBQSxJQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLENBQWhCO1VBQWIsQ0FBWCxDQUFBLElBQStDO1VBQzdELEtBQUMsQ0FBQSxPQUFELENBQVMsYUFBVCxFQUF3QixXQUF4QjtVQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sYUFBUCxFQUFzQixXQUF0QixFQUFtQyxLQUFuQztVQUdBLFVBQUEsR0FBYSxLQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFWLEVBQWtDLGNBQWxDO1VBQ2IsSUFBSSxrQkFBSjtZQUNFLElBQUEsR0FBTyxPQUFBLENBQVEsbUJBQVI7WUFDUCxNQUFBLEdBQVM7Y0FDUCx3QkFBQSxFQUNFO2dCQUFBLE9BQUEsRUFBUyxPQUFPLENBQUMsV0FBakI7ZUFGSzs7WUFJVCxVQUFBLEdBQWEsS0FBQyxDQUFBLFFBQUQsQ0FBVSxnQkFBVixFQUE0QixJQUFJLENBQUMsUUFBTCxDQUFjLE1BQWQsQ0FBNUIsRUFOZjs7VUFRQSxnQkFBQSxHQUFtQixDQUNqQixnQkFEaUIsRUFFakIsbUJBRmlCLEVBR2pCLFNBSGlCLEVBR04sa0JBSE07VUFLbkIsVUFBQSxHQUFhO1lBQ1gsZ0JBQUEsRUFBa0IsSUFEUDtZQUVYLEdBQUEsRUFBb0Isa0JBQWYsR0FBQSxXQUFBLEdBQUEsTUFGTTtZQUdYLE9BQUEsRUFBUyxTQUFDLEtBQUQ7cUJBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWO1lBQVgsQ0FIRTs7VUFLYixJQUFpRCxrQkFBakQ7WUFBQSxnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQixVQUF0QixFQUFrQyxVQUFsQyxFQUFBOztVQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sbUJBQVAsRUFBNEIsZ0JBQTVCO2lCQUVBLENBQUksT0FBTyxDQUFDLFlBQVgsR0FDQyxLQUFDLENBQUEsR0FBRCxDQUFLLFdBQUwsRUFBa0IsZ0JBQWxCLEVBQW9DLFVBQXBDLENBREQsR0FFQyxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsQ0FBZSxDQUFDLEdBQWhCLENBQW9CLGdCQUFwQixFQUFzQyxVQUF0QyxDQUZGLENBR0MsQ0FBQyxJQUhGLENBR08sU0FBQyxNQUFEO0FBQ0wsZ0JBQUE7WUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGdCQUFQLEVBQXlCLE1BQXpCO1lBRUEsSUFBZSxNQUFNLENBQUMsTUFBUCxLQUFpQixDQUFoQztBQUFBLHFCQUFPLEtBQVA7O1lBRUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxLQUFQLENBQWEsd0JBQWI7WUFDVCxJQUFxRCxNQUFNLENBQUMsTUFBUCxLQUFpQixDQUF0RTtjQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsS0FBUCxDQUFhLDBCQUFiLEVBQVQ7O21CQUVBLE1BQU8sQ0FBQSxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUFoQjtVQVJGLENBSFA7UUE5Qkk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSk47SUFUUTs7OztLQXZCMkI7QUFSdkMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9iYmF0c292L3J1Ym9jb3BcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUnVib2NvcCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJSdWJvY29wXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYmJhdHNvdi9ydWJvY29wXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFJ1Ynk6XG4gICAgICBpbmRlbnRfc2l6ZTogdHJ1ZVxuICAgICAgcnVib2NvcF9wYXRoOiB0cnVlXG4gIH1cblxuICBleGVjdXRhYmxlczogW1xuICAgIHtcbiAgICAgIG5hbWU6IFwiUnVib2NvcFwiXG4gICAgICBjbWQ6IFwicnVib2NvcFwiXG4gICAgICBob21lcGFnZTogXCJodHRwOi8vcnVib2NvcC5yZWFkdGhlZG9jcy5pby9cIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHA6Ly9ydWJvY29wLnJlYWR0aGVkb2NzLmlvL2VuL2xhdGVzdC9pbnN0YWxsYXRpb24vXCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC8oXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXG4gICAgICB9XG4gICAgfVxuICBdXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucywgY29udGV4dCkgLT5cbiAgICBmdWxsUGF0aCA9IGNvbnRleHQuZmlsZVBhdGggb3IgXCJcIlxuICAgIFtwcm9qZWN0UGF0aCwgX3JlbGF0aXZlUGF0aF0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZnVsbFBhdGgpXG5cbiAgICAjIERlcHJlY2F0ZSBvcHRpb25zLnJ1Ym9jb3BfcGF0aFxuICAgIGlmIG9wdGlvbnMucnVib2NvcF9wYXRoXG4gICAgICBAZGVwcmVjYXRlT3B0aW9uRm9yRXhlY3V0YWJsZShcIlJ1Ym9jb3BcIiwgXCJSdWJ5IC0gUnVib2NvcCBQYXRoIChydWJvY29wX3BhdGgpXCIsIFwiUGF0aFwiKVxuXG4gICAgIyBGaW5kIHRoZSBydWJvY29wIHBhdGhcbiAgICBAUHJvbWlzZS5hbGwoW1xuICAgICAgQHdoaWNoKG9wdGlvbnMucnVib2NvcF9wYXRoKSBpZiBvcHRpb25zLnJ1Ym9jb3BfcGF0aFxuICAgICAgQHdoaWNoKCdydWJvY29wJylcbiAgICBdKVxuICAgIC50aGVuKChwYXRocykgPT5cbiAgICAgIEBkZWJ1ZygncnVib2NvcCBwYXRocycsIHBhdGhzKVxuICAgICAgIyBHZXQgZmlyc3QgdmFsaWQsIGFic29sdXRlIHBhdGhcbiAgICAgIHJ1Ym9jb3BQYXRoID0gcGF0aHMuZmluZCgocCkgLT4gcCBhbmQgcGF0aC5pc0Fic29sdXRlKHApKSBvciBcInJ1Ym9jb3BcIlxuICAgICAgQHZlcmJvc2UoJ3J1Ym9jb3BQYXRoJywgcnVib2NvcFBhdGgpXG4gICAgICBAZGVidWcoJ3J1Ym9jb3BQYXRoJywgcnVib2NvcFBhdGgsIHBhdGhzKVxuXG4gICAgICAjIEZpbmQgb3IgZ2VuZXJhdGUgYSBjb25maWcgZmlsZSBpZiBub24gZXhpc3RzXG4gICAgICBjb25maWdGaWxlID0gQGZpbmRGaWxlKHBhdGguZGlybmFtZShmdWxsUGF0aCksIFwiLnJ1Ym9jb3AueW1sXCIpXG4gICAgICBpZiAhY29uZmlnRmlsZT9cbiAgICAgICAgeWFtbCA9IHJlcXVpcmUoXCJ5YW1sLWZyb250LW1hdHRlclwiKVxuICAgICAgICBjb25maWcgPSB7XG4gICAgICAgICAgXCJTdHlsZS9JbmRlbnRhdGlvbldpZHRoXCI6XG4gICAgICAgICAgICBcIldpZHRoXCI6IG9wdGlvbnMuaW5kZW50X3NpemVcbiAgICAgICAgfVxuICAgICAgICB0ZW1wQ29uZmlnID0gQHRlbXBGaWxlKFwicnVib2NvcC1jb25maWdcIiwgeWFtbC5zYWZlRHVtcChjb25maWcpKVxuXG4gICAgICBydWJvY29wQXJndW1lbnRzID0gW1xuICAgICAgICBcIi0tYXV0by1jb3JyZWN0XCJcbiAgICAgICAgXCItLWZvcmNlLWV4Y2x1c2lvblwiXG4gICAgICAgIFwiLS1zdGRpblwiLCBcImF0b20tYmVhdXRpZnkucmJcIiAjIGZpbGVuYW1lIGlzIHJlcXVpcmVkIGJ1dCBub3QgdXNlZFxuICAgICAgXVxuICAgICAgZXhlT3B0aW9ucyA9IHtcbiAgICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZSxcbiAgICAgICAgY3dkOiBwcm9qZWN0UGF0aCBpZiBjb25maWdGaWxlPyxcbiAgICAgICAgb25TdGRpbjogKHN0ZGluKSAtPiBzdGRpbi5lbmQgdGV4dFxuICAgICAgfVxuICAgICAgcnVib2NvcEFyZ3VtZW50cy5wdXNoKFwiLS1jb25maWdcIiwgdGVtcENvbmZpZykgaWYgdGVtcENvbmZpZz9cbiAgICAgIEBkZWJ1ZyhcInJ1Ym9jb3AgYXJndW1lbnRzXCIsIHJ1Ym9jb3BBcmd1bWVudHMpXG5cbiAgICAgIChpZiBvcHRpb25zLnJ1Ym9jb3BfcGF0aCB0aGVuIFxcXG4gICAgICAgIEBydW4ocnVib2NvcFBhdGgsIHJ1Ym9jb3BBcmd1bWVudHMsIGV4ZU9wdGlvbnMpIGVsc2UgXFxcbiAgICAgICAgQGV4ZShcInJ1Ym9jb3BcIikucnVuKHJ1Ym9jb3BBcmd1bWVudHMsIGV4ZU9wdGlvbnMpXG4gICAgICApLnRoZW4oKHN0ZG91dCkgPT5cbiAgICAgICAgQGRlYnVnKFwicnVib2NvcCBvdXRwdXRcIiwgc3Rkb3V0KVxuICAgICAgICAjIFJ1Ym9jb3Agb3V0cHV0IGFuIGVycm9yIGlmIHN0ZG91dCBpcyBlbXB0eVxuICAgICAgICByZXR1cm4gdGV4dCBpZiBzdGRvdXQubGVuZ3RoID09IDBcblxuICAgICAgICByZXN1bHQgPSBzdGRvdXQuc3BsaXQoXCI9PT09PT09PT09PT09PT09PT09PVxcblwiKVxuICAgICAgICByZXN1bHQgPSBzdGRvdXQuc3BsaXQoXCI9PT09PT09PT09PT09PT09PT09PVxcclxcblwiKSBpZiByZXN1bHQubGVuZ3RoID09IDFcblxuICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdXG4gICAgICApXG4gICAgKVxuIl19
