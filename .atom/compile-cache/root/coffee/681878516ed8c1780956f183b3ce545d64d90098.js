(function() {
  "use strict";
  var Beautifier, LatexBeautify, fs, path, temp,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  fs = require("fs");

  temp = require("temp").track();

  module.exports = LatexBeautify = (function(superClass) {
    extend(LatexBeautify, superClass);

    function LatexBeautify() {
      return LatexBeautify.__super__.constructor.apply(this, arguments);
    }

    LatexBeautify.prototype.name = "Latex Beautify";

    LatexBeautify.prototype.link = "https://github.com/cmhughes/latexindent.pl";

    LatexBeautify.prototype.isPreInstalled = false;

    LatexBeautify.prototype.options = {
      LaTeX: true
    };

    LatexBeautify.prototype.buildConfigFile = function(options) {
      var config, delim, i, indentChar, len, ref;
      indentChar = options.indent_char;
      if (options.indent_with_tabs) {
        indentChar = "\\t";
      }
      config = "defaultIndent: \"" + indentChar + "\"\nalwaysLookforSplitBraces: " + (+options.always_look_for_split_braces) + "\nalwaysLookforSplitBrackets: " + (+options.always_look_for_split_brackets) + "\nindentPreamble: " + (+options.indent_preamble) + "\nremoveTrailingWhitespace: " + (+options.remove_trailing_whitespace) + "\nlookForAlignDelims:\n";
      ref = options.align_columns_in_environments;
      for (i = 0, len = ref.length; i < len; i++) {
        delim = ref[i];
        config += "\t" + delim + ": 1\n";
      }
      return config;
    };

    LatexBeautify.prototype.setUpDir = function(dirPath, text, config) {
      this.texFile = path.join(dirPath, "latex.tex");
      fs.writeFile(this.texFile, text, function(err) {
        if (err) {
          return reject(err);
        }
      });
      this.configFile = path.join(dirPath, "localSettings.yaml");
      fs.writeFile(this.configFile, config, function(err) {
        if (err) {
          return reject(err);
        }
      });
      this.logFile = path.join(dirPath, "indent.log");
      return fs.writeFile(this.logFile, "", function(err) {
        if (err) {
          return reject(err);
        }
      });
    };

    LatexBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        return temp.mkdir("latex", function(err, dirPath) {
          if (err) {
            return reject(err);
          }
          return resolve(dirPath);
        });
      }).then((function(_this) {
        return function(dirPath) {
          var run;
          _this.setUpDir(dirPath, text, _this.buildConfigFile(options));
          return run = _this.run("latexindent", ["-s", "-l", "-c=" + dirPath, _this.texFile, "-o", _this.texFile], {
            help: {
              link: "https://github.com/cmhughes/latexindent.pl"
            }
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.readFile(_this.texFile);
        };
      })(this));
    };

    return LatexBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2xhdGV4LWJlYXV0aWZ5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSx5Q0FBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUE7O0VBR1AsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7NEJBQ3JCLElBQUEsR0FBTTs7NEJBQ04sSUFBQSxHQUFNOzs0QkFDTixjQUFBLEdBQWdCOzs0QkFFaEIsT0FBQSxHQUFTO01BQ1AsS0FBQSxFQUFPLElBREE7Ozs0QkFNVCxlQUFBLEdBQWlCLFNBQUMsT0FBRDtBQUNmLFVBQUE7TUFBQSxVQUFBLEdBQWEsT0FBTyxDQUFDO01BQ3JCLElBQUcsT0FBTyxDQUFDLGdCQUFYO1FBQ0UsVUFBQSxHQUFhLE1BRGY7O01BR0EsTUFBQSxHQUFTLG1CQUFBLEdBQ21CLFVBRG5CLEdBQzhCLGdDQUQ5QixHQUUyQixDQUFDLENBQUMsT0FBTyxDQUFDLDRCQUFWLENBRjNCLEdBRWtFLGdDQUZsRSxHQUc2QixDQUFDLENBQUMsT0FBTyxDQUFDLDhCQUFWLENBSDdCLEdBR3NFLG9CQUh0RSxHQUlpQixDQUFDLENBQUMsT0FBTyxDQUFDLGVBQVYsQ0FKakIsR0FJMkMsOEJBSjNDLEdBSzJCLENBQUMsQ0FBQyxPQUFPLENBQUMsMEJBQVYsQ0FMM0IsR0FLZ0U7QUFHekU7QUFBQSxXQUFBLHFDQUFBOztRQUNFLE1BQUEsSUFBVSxJQUFBLEdBQUssS0FBTCxHQUFXO0FBRHZCO0FBRUEsYUFBTztJQWZROzs0QkFxQmpCLFFBQUEsR0FBVSxTQUFDLE9BQUQsRUFBVSxJQUFWLEVBQWdCLE1BQWhCO01BQ1IsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsV0FBbkI7TUFDWCxFQUFFLENBQUMsU0FBSCxDQUFhLElBQUMsQ0FBQSxPQUFkLEVBQXVCLElBQXZCLEVBQTZCLFNBQUMsR0FBRDtRQUMzQixJQUFzQixHQUF0QjtBQUFBLGlCQUFPLE1BQUEsQ0FBTyxHQUFQLEVBQVA7O01BRDJCLENBQTdCO01BRUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsb0JBQW5CO01BQ2QsRUFBRSxDQUFDLFNBQUgsQ0FBYSxJQUFDLENBQUEsVUFBZCxFQUEwQixNQUExQixFQUFrQyxTQUFDLEdBQUQ7UUFDaEMsSUFBc0IsR0FBdEI7QUFBQSxpQkFBTyxNQUFBLENBQU8sR0FBUCxFQUFQOztNQURnQyxDQUFsQztNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLFlBQW5CO2FBQ1gsRUFBRSxDQUFDLFNBQUgsQ0FBYSxJQUFDLENBQUEsT0FBZCxFQUF1QixFQUF2QixFQUEyQixTQUFDLEdBQUQ7UUFDekIsSUFBc0IsR0FBdEI7QUFBQSxpQkFBTyxNQUFBLENBQU8sR0FBUCxFQUFQOztNQUR5QixDQUEzQjtJQVJROzs0QkFZVixRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjthQUNSLElBQUksSUFBQyxDQUFBLE9BQUwsQ0FBYSxTQUFDLE9BQUQsRUFBVSxNQUFWO2VBQ1gsSUFBSSxDQUFDLEtBQUwsQ0FBVyxPQUFYLEVBQW9CLFNBQUMsR0FBRCxFQUFNLE9BQU47VUFDbEIsSUFBc0IsR0FBdEI7QUFBQSxtQkFBTyxNQUFBLENBQU8sR0FBUCxFQUFQOztpQkFDQSxPQUFBLENBQVEsT0FBUjtRQUZrQixDQUFwQjtNQURXLENBQWIsQ0FNQSxDQUFDLElBTkQsQ0FNTSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxLQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsRUFBeUIsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsT0FBakIsQ0FBekI7aUJBQ0EsR0FBQSxHQUFNLEtBQUMsQ0FBQSxHQUFELENBQUssYUFBTCxFQUFvQixDQUN4QixJQUR3QixFQUV4QixJQUZ3QixFQUd4QixLQUFBLEdBQVEsT0FIZ0IsRUFJeEIsS0FBQyxDQUFBLE9BSnVCLEVBS3hCLElBTHdCLEVBTXhCLEtBQUMsQ0FBQSxPQU51QixDQUFwQixFQU9IO1lBQUEsSUFBQSxFQUFNO2NBQ1AsSUFBQSxFQUFNLDRDQURDO2FBQU47V0FQRztRQUZGO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQU5OLENBbUJBLENBQUMsSUFuQkQsQ0FtQk8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNMLEtBQUMsQ0FBQSxRQUFELENBQVUsS0FBQyxDQUFBLE9BQVg7UUFESztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FuQlA7SUFEUTs7OztLQTVDaUM7QUFQN0MiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5mcyA9IHJlcXVpcmUoXCJmc1wiKVxudGVtcCA9IHJlcXVpcmUoXCJ0ZW1wXCIpLnRyYWNrKClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIExhdGV4QmVhdXRpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiTGF0ZXggQmVhdXRpZnlcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9jbWh1Z2hlcy9sYXRleGluZGVudC5wbFwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBMYVRlWDogdHJ1ZVxuICB9XG5cbiAgIyBUaGVyZSBhcmUgdG9vIG1hbnkgb3B0aW9ucyB3aXRoIGxhdGV4bWssIEkgaGF2ZSB0cmllZCB0byBzbGltIHRoaXMgZG93biB0byB0aGUgbW9zdCB1c2VmdWwgb25lcy5cbiAgIyBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgY29uZmlndXJhdGlvbiBmaWxlIGZvciBsYXRleGluZGVudC5cbiAgYnVpbGRDb25maWdGaWxlOiAob3B0aW9ucykgLT5cbiAgICBpbmRlbnRDaGFyID0gb3B0aW9ucy5pbmRlbnRfY2hhclxuICAgIGlmIG9wdGlvbnMuaW5kZW50X3dpdGhfdGFic1xuICAgICAgaW5kZW50Q2hhciA9IFwiXFxcXHRcIlxuICAgICMgK3RydWUgPSAxIGFuZCArZmFsc2UgPSAwXG4gICAgY29uZmlnID0gXCJcIlwiXG4gICAgICAgICAgICAgZGVmYXVsdEluZGVudDogXFxcIiN7aW5kZW50Q2hhcn1cXFwiXG4gICAgICAgICAgICAgYWx3YXlzTG9va2ZvclNwbGl0QnJhY2VzOiAjeytvcHRpb25zLmFsd2F5c19sb29rX2Zvcl9zcGxpdF9icmFjZXN9XG4gICAgICAgICAgICAgYWx3YXlzTG9va2ZvclNwbGl0QnJhY2tldHM6ICN7K29wdGlvbnMuYWx3YXlzX2xvb2tfZm9yX3NwbGl0X2JyYWNrZXRzfVxuICAgICAgICAgICAgIGluZGVudFByZWFtYmxlOiAjeytvcHRpb25zLmluZGVudF9wcmVhbWJsZX1cbiAgICAgICAgICAgICByZW1vdmVUcmFpbGluZ1doaXRlc3BhY2U6ICN7K29wdGlvbnMucmVtb3ZlX3RyYWlsaW5nX3doaXRlc3BhY2V9XG4gICAgICAgICAgICAgbG9va0ZvckFsaWduRGVsaW1zOlxcblxuICAgICAgICAgICAgIFwiXCJcIlxuICAgIGZvciBkZWxpbSBpbiBvcHRpb25zLmFsaWduX2NvbHVtbnNfaW5fZW52aXJvbm1lbnRzXG4gICAgICBjb25maWcgKz0gXCJcXHQje2RlbGltfTogMVxcblwiXG4gICAgcmV0dXJuIGNvbmZpZ1xuXG4gICMgTGF0ZXhpbmRlbnQgYWNjZXB0cyBjb25maWd1cmF0aW9uIF9maWxlc18gb25seS5cbiAgIyBUaGlzIGZpbGUgaGFzIHRvIGJlIG5hbWVkIGxvY2FsU2V0dGluZ3MueWFtbCBhbmQgYmUgaW4gdGhlIHNhbWUgZm9sZGVyIGFzIHRoZSB0ZXggZmlsZS5cbiAgIyBJdCBhbHNvIGluc2lzdHMgb24gY3JlYXRpbmcgYSBsb2cgZmlsZSBzb21ld2hlcmUuXG4gICMgU28gd2Ugc2V0IHVwIGEgZGlyZWN0b3J5IHdpdGggYWxsIHRoZSBmaWxlcyBpbiBwbGFjZS5cbiAgc2V0VXBEaXI6IChkaXJQYXRoLCB0ZXh0LCBjb25maWcpIC0+XG4gICAgQHRleEZpbGUgPSBwYXRoLmpvaW4oZGlyUGF0aCwgXCJsYXRleC50ZXhcIilcbiAgICBmcy53cml0ZUZpbGUgQHRleEZpbGUsIHRleHQsIChlcnIpIC0+XG4gICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgQGNvbmZpZ0ZpbGUgPSBwYXRoLmpvaW4oZGlyUGF0aCwgXCJsb2NhbFNldHRpbmdzLnlhbWxcIilcbiAgICBmcy53cml0ZUZpbGUgQGNvbmZpZ0ZpbGUsIGNvbmZpZywgKGVycikgLT5cbiAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcbiAgICBAbG9nRmlsZSA9IHBhdGguam9pbihkaXJQYXRoLCBcImluZGVudC5sb2dcIilcbiAgICBmcy53cml0ZUZpbGUgQGxvZ0ZpbGUsIFwiXCIsIChlcnIpIC0+XG4gICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG5cbiAgI0JlYXV0aWZpZXIgZG9lcyBub3QgY3VycmVudGx5IGhhdmUgYSBtZXRob2QgZm9yIGNyZWF0aW5nIGRpcmVjdG9yaWVzLCBzbyB3ZSBjYWxsIHRlbXAgZGlyZWN0bHkuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICB0ZW1wLm1rZGlyKFwibGF0ZXhcIiwgKGVyciwgZGlyUGF0aCkgLT5cbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICByZXNvbHZlKGRpclBhdGgpXG4gICAgICApXG4gICAgKVxuICAgIC50aGVuKChkaXJQYXRoKT0+XG4gICAgICBAc2V0VXBEaXIoZGlyUGF0aCwgdGV4dCwgQGJ1aWxkQ29uZmlnRmlsZShvcHRpb25zKSlcbiAgICAgIHJ1biA9IEBydW4gXCJsYXRleGluZGVudFwiLCBbXG4gICAgICAgIFwiLXNcIiAgICAgICAgICAgICNTaWxlbnQgbW9kZVxuICAgICAgICBcIi1sXCIgICAgICAgICAgICAjVGVsbCBsYXRleGluZGVudCB3ZSBoYXZlIGEgbG9jYWwgY29uZmlndXJhdGlvbiBmaWxlXG4gICAgICAgIFwiLWM9XCIgKyBkaXJQYXRoICNUZWxsIGxhdGV4aW5kZW50IHRvIHBsYWNlIHRoZSBsb2cgZmlsZSBpbiB0aGlzIGRpcmVjdG9yeVxuICAgICAgICBAdGV4RmlsZVxuICAgICAgICBcIi1vXCIgICAgICAgICAgICAjT3V0cHV0IHRvIHRoZSBzYW1lIGxvY2F0aW9uIGFzIGZpbGUsIC13IGNyZWF0ZXMgYSBiYWNrdXAgZmlsZSwgd2hlcmVhcyB0aGlzIGRvZXMgbm90XG4gICAgICAgIEB0ZXhGaWxlXG4gICAgICBdLCBoZWxwOiB7XG4gICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2NtaHVnaGVzL2xhdGV4aW5kZW50LnBsXCJcbiAgICAgIH1cbiAgICApXG4gICAgLnRoZW4oID0+XG4gICAgICBAcmVhZEZpbGUoQHRleEZpbGUpXG4gICAgKVxuIl19
