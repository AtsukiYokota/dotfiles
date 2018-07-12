
/*
Requires https://github.com/FriendsOfPHP/phpcbf
 */

(function() {
  "use strict";
  var Beautifier, PHPCBF,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PHPCBF = (function(superClass) {
    extend(PHPCBF, superClass);

    function PHPCBF() {
      return PHPCBF.__super__.constructor.apply(this, arguments);
    }

    PHPCBF.prototype.name = "PHPCBF";

    PHPCBF.prototype.link = "http://php.net/manual/en/install.php";

    PHPCBF.prototype.executables = [
      {
        name: "PHP",
        cmd: "php",
        homepage: "http://php.net/",
        installation: "http://php.net/manual/en/install.php",
        version: {
          parse: function(text) {
            return text.match(/PHP (\d+\.\d+\.\d+)/)[1];
          }
        }
      }, {
        name: "PHPCBF",
        cmd: "phpcbf",
        homepage: "https://github.com/squizlabs/PHP_CodeSniffer",
        installation: "https://github.com/squizlabs/PHP_CodeSniffer#installation",
        version: {
          parse: function(text) {
            return text.match(/version (\d+\.\d+\.\d+)/)[1];
          }
        },
        docker: {
          image: "unibeautify/phpcbf"
        }
      }
    ];

    PHPCBF.prototype.options = {
      PHP: {
        phpcbf_path: true,
        phpcbf_version: true,
        standard: true
      }
    };

    PHPCBF.prototype.beautify = function(text, language, options) {
      var php, phpcbf, standardFile, standardFiles;
      this.debug('phpcbf', options);
      standardFiles = ['phpcs.xml', 'phpcs.xml.dist', 'phpcs.ruleset.xml', 'ruleset.xml'];
      standardFile = this.findFile(atom.project.getPaths()[0], standardFiles);
      if (standardFile) {
        options.standard = standardFile;
      }
      php = this.exe('php');
      phpcbf = this.exe('phpcbf');
      if (options.phpcbf_path) {
        this.deprecateOptionForExecutable("PHPCBF", "PHP - PHPCBF Path (phpcbf_path)", "Path");
      }
      return this.Promise.all([options.phpcbf_path ? this.which(options.phpcbf_path) : void 0, phpcbf.path(), this.tempFile("temp", text, ".php")]).then((function(_this) {
        return function(arg) {
          var customPhpcbfPath, finalPhpcbfPath, isPhpScript, isVersion3, phpcbfPath, tempFile;
          customPhpcbfPath = arg[0], phpcbfPath = arg[1], tempFile = arg[2];
          finalPhpcbfPath = customPhpcbfPath && path.isAbsolute(customPhpcbfPath) ? customPhpcbfPath : phpcbfPath;
          _this.verbose('finalPhpcbfPath', finalPhpcbfPath, phpcbfPath, customPhpcbfPath);
          isVersion3 = (phpcbf.isInstalled && phpcbf.isVersion('3.x')) || (options.phpcbf_version && phpcbf.versionSatisfies(options.phpcbf_version + ".0.0", '3.x'));
          isPhpScript = (finalPhpcbfPath.indexOf(".phar") !== -1) || (finalPhpcbfPath.indexOf(".php") !== -1);
          _this.verbose('isPhpScript', isPhpScript);
          if (isPhpScript) {
            return php.run([phpcbfPath, !isVersion3 ? "--no-patch" : void 0, options.standard ? "--standard=" + options.standard : void 0, tempFile], {
              ignoreReturnCode: true,
              onStdin: function(stdin) {
                return stdin.end();
              }
            }).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return phpcbf.run([!isVersion3 ? "--no-patch" : void 0, options.standard ? "--standard=" + options.standard : void 0, tempFile = _this.tempFile("temp", text, ".php")], {
              ignoreReturnCode: true,
              onStdin: function(stdin) {
                return stdin.end();
              }
            }).then(function() {
              return _this.readFile(tempFile);
            });
          }
        };
      })(this));
    };

    return PHPCBF;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3BocGNiZi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsa0JBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3FCQUNyQixJQUFBLEdBQU07O3FCQUNOLElBQUEsR0FBTTs7cUJBQ04sV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sS0FEUjtRQUVFLEdBQUEsRUFBSyxLQUZQO1FBR0UsUUFBQSxFQUFVLGlCQUhaO1FBSUUsWUFBQSxFQUFjLHNDQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxxQkFBWCxDQUFrQyxDQUFBLENBQUE7VUFBNUMsQ0FEQTtTQUxYO09BRFcsRUFVWDtRQUNFLElBQUEsRUFBTSxRQURSO1FBRUUsR0FBQSxFQUFLLFFBRlA7UUFHRSxRQUFBLEVBQVUsOENBSFo7UUFJRSxZQUFBLEVBQWMsMkRBSmhCO1FBS0UsT0FBQSxFQUFTO1VBQ1AsS0FBQSxFQUFPLFNBQUMsSUFBRDttQkFBVSxJQUFJLENBQUMsS0FBTCxDQUFXLHlCQUFYLENBQXNDLENBQUEsQ0FBQTtVQUFoRCxDQURBO1NBTFg7UUFRRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8sb0JBREQ7U0FSVjtPQVZXOzs7cUJBd0JiLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxJQUFiO1FBQ0EsY0FBQSxFQUFnQixJQURoQjtRQUVBLFFBQUEsRUFBVSxJQUZWO09BRks7OztxQkFPVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7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QyxLQUFEO3VCQUNQLEtBQUssQ0FBQyxHQUFOLENBQUE7Y0FETyxDQUZSO2FBSkwsQ0FTRSxDQUFDLElBVEgsQ0FTUSxTQUFBO3FCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtZQURJLENBVFIsRUFmRjs7UUFaTTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKUjtJQWRROzs7O0tBbEMwQjtBQVB0QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9waHBjYmZcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUEhQQ0JGIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlBIUENCRlwiXG4gIGxpbms6IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcbiAgZXhlY3V0YWJsZXM6IFtcbiAgICB7XG4gICAgICBuYW1lOiBcIlBIUFwiXG4gICAgICBjbWQ6IFwicGhwXCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHA6Ly9waHAubmV0L1wiXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC9QSFAgKFxcZCtcXC5cXGQrXFwuXFxkKykvKVsxXVxuICAgICAgfVxuICAgIH1cbiAgICB7XG4gICAgICBuYW1lOiBcIlBIUENCRlwiXG4gICAgICBjbWQ6IFwicGhwY2JmXCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9zcXVpemxhYnMvUEhQX0NvZGVTbmlmZmVyXCJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2dpdGh1Yi5jb20vc3F1aXpsYWJzL1BIUF9Db2RlU25pZmZlciNpbnN0YWxsYXRpb25cIlxuICAgICAgdmVyc2lvbjoge1xuICAgICAgICBwYXJzZTogKHRleHQpIC0+IHRleHQubWF0Y2goL3ZlcnNpb24gKFxcZCtcXC5cXGQrXFwuXFxkKykvKVsxXVxuICAgICAgfVxuICAgICAgZG9ja2VyOiB7XG4gICAgICAgIGltYWdlOiBcInVuaWJlYXV0aWZ5L3BocGNiZlwiXG4gICAgICB9XG4gICAgfVxuICBdXG5cbiAgb3B0aW9uczoge1xuICAgIFBIUDpcbiAgICAgIHBocGNiZl9wYXRoOiB0cnVlXG4gICAgICBwaHBjYmZfdmVyc2lvbjogdHJ1ZVxuICAgICAgc3RhbmRhcmQ6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQGRlYnVnKCdwaHBjYmYnLCBvcHRpb25zKVxuICAgIHN0YW5kYXJkRmlsZXMgPSBbJ3BocGNzLnhtbCcsICdwaHBjcy54bWwuZGlzdCcsICdwaHBjcy5ydWxlc2V0LnhtbCcsICdydWxlc2V0LnhtbCddXG4gICAgc3RhbmRhcmRGaWxlID0gQGZpbmRGaWxlKGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdLCBzdGFuZGFyZEZpbGVzKVxuXG4gICAgb3B0aW9ucy5zdGFuZGFyZCA9IHN0YW5kYXJkRmlsZSBpZiBzdGFuZGFyZEZpbGVcblxuICAgIHBocCA9IEBleGUoJ3BocCcpXG4gICAgcGhwY2JmID0gQGV4ZSgncGhwY2JmJylcblxuICAgIGlmIG9wdGlvbnMucGhwY2JmX3BhdGhcbiAgICAgIEBkZXByZWNhdGVPcHRpb25Gb3JFeGVjdXRhYmxlKFwiUEhQQ0JGXCIsIFwiUEhQIC0gUEhQQ0JGIFBhdGggKHBocGNiZl9wYXRoKVwiLCBcIlBhdGhcIilcblxuICAgICMgRmluZCBwaHBjYmYucGhhciBzY3JpcHRcbiAgICBAUHJvbWlzZS5hbGwoW1xuICAgICAgQHdoaWNoKG9wdGlvbnMucGhwY2JmX3BhdGgpIGlmIG9wdGlvbnMucGhwY2JmX3BhdGhcbiAgICAgIHBocGNiZi5wYXRoKClcbiAgICAgIEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dCwgXCIucGhwXCIpXG4gICAgXSkudGhlbigoW2N1c3RvbVBocGNiZlBhdGgsIHBocGNiZlBhdGgsIHRlbXBGaWxlXSkgPT5cbiAgICAgICMgR2V0IGZpcnN0IHZhbGlkLCBhYnNvbHV0ZSBwYXRoXG4gICAgICBmaW5hbFBocGNiZlBhdGggPSBpZiBjdXN0b21QaHBjYmZQYXRoIGFuZCBwYXRoLmlzQWJzb2x1dGUoY3VzdG9tUGhwY2JmUGF0aCkgdGhlbiBcXFxuICAgICAgICBjdXN0b21QaHBjYmZQYXRoIGVsc2UgcGhwY2JmUGF0aFxuICAgICAgQHZlcmJvc2UoJ2ZpbmFsUGhwY2JmUGF0aCcsIGZpbmFsUGhwY2JmUGF0aCwgcGhwY2JmUGF0aCwgY3VzdG9tUGhwY2JmUGF0aClcblxuICAgICAgaXNWZXJzaW9uMyA9ICgocGhwY2JmLmlzSW5zdGFsbGVkIGFuZCBwaHBjYmYuaXNWZXJzaW9uKCczLngnKSkgb3IgXFxcbiAgICAgICAgKG9wdGlvbnMucGhwY2JmX3ZlcnNpb24gYW5kIHBocGNiZi52ZXJzaW9uU2F0aXNmaWVzKFwiI3tvcHRpb25zLnBocGNiZl92ZXJzaW9ufS4wLjBcIiwgJzMueCcpKSlcblxuICAgICAgaXNQaHBTY3JpcHQgPSAoZmluYWxQaHBjYmZQYXRoLmluZGV4T2YoXCIucGhhclwiKSBpc250IC0xKSBvciAoZmluYWxQaHBjYmZQYXRoLmluZGV4T2YoXCIucGhwXCIpIGlzbnQgLTEpXG4gICAgICBAdmVyYm9zZSgnaXNQaHBTY3JpcHQnLCBpc1BocFNjcmlwdClcblxuICAgICAgaWYgaXNQaHBTY3JpcHRcbiAgICAgICAgcGhwLnJ1bihbXG4gICAgICAgICAgcGhwY2JmUGF0aCxcbiAgICAgICAgICBcIi0tbm8tcGF0Y2hcIiB1bmxlc3MgaXNWZXJzaW9uM1xuICAgICAgICAgIFwiLS1zdGFuZGFyZD0je29wdGlvbnMuc3RhbmRhcmR9XCIgaWYgb3B0aW9ucy5zdGFuZGFyZFxuICAgICAgICAgIHRlbXBGaWxlXG4gICAgICAgICAgXSwge1xuICAgICAgICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZVxuICAgICAgICAgICAgb25TdGRpbjogKHN0ZGluKSAtPlxuICAgICAgICAgICAgICBzdGRpbi5lbmQoKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICApXG4gICAgICBlbHNlXG4gICAgICAgIHBocGNiZi5ydW4oW1xuICAgICAgICAgIFwiLS1uby1wYXRjaFwiIHVubGVzcyBpc1ZlcnNpb24zXG4gICAgICAgICAgXCItLXN0YW5kYXJkPSN7b3B0aW9ucy5zdGFuZGFyZH1cIiBpZiBvcHRpb25zLnN0YW5kYXJkXG4gICAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQsIFwiLnBocFwiKVxuICAgICAgICAgIF0sIHtcbiAgICAgICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgICAgICAgIG9uU3RkaW46IChzdGRpbikgLT5cbiAgICAgICAgICAgICAgc3RkaW4uZW5kKClcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgKVxuICAgICAgKVxuIl19
