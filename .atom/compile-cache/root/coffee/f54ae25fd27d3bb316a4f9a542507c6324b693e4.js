
/*
Requires https://www.gnu.org/software/emacs/
 */

(function() {
  "use strict";
  var Beautifier, FortranBeautifier, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('../beautifier');

  path = require("path");

  module.exports = FortranBeautifier = (function(superClass) {
    extend(FortranBeautifier, superClass);

    function FortranBeautifier() {
      return FortranBeautifier.__super__.constructor.apply(this, arguments);
    }

    FortranBeautifier.prototype.name = "Fortran Beautifier";

    FortranBeautifier.prototype.link = "https://www.gnu.org/software/emacs/";

    FortranBeautifier.prototype.executables = [
      {
        name: "Emacs",
        cmd: "emacs",
        homepage: "https://www.gnu.org/software/emacs/",
        installation: "https://www.gnu.org/software/emacs/",
        version: {
          parse: function(text) {
            return text.match(/Emacs (\d+\.\d+\.\d+)/)[1];
          }
        }
      }
    ];

    FortranBeautifier.prototype.options = {
      Fortran: true
    };

    FortranBeautifier.prototype.beautify = function(text, language, options) {
      var args, emacs, emacs_path, emacs_script_path, tempFile;
      this.debug('fortran-beautifier', options);
      emacs = this.exe("emacs");
      emacs_path = options.emacs_path;
      emacs_script_path = options.emacs_script_path;
      if (!emacs_script_path) {
        emacs_script_path = path.resolve(__dirname, "emacs-fortran-formating-script.lisp");
      }
      this.debug('fortran-beautifier', 'emacs script path: ' + emacs_script_path);
      args = ['--batch', '-l', emacs_script_path, '-f', 'f90-batch-indent-region', tempFile = this.tempFile("temp", text)];
      if (emacs_path) {
        this.deprecateOptionForExecutable("Emacs", "emacs_path", "Path");
        return this.run(emacs_path, args, {
          ignoreReturnCode: false
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      } else {
        return emacs.run(args, {
          ignoreReturnCode: false
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return FortranBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2ZvcnRyYW4tYmVhdXRpZmllci9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsbUNBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztnQ0FDckIsSUFBQSxHQUFNOztnQ0FDTixJQUFBLEdBQU07O2dDQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLE9BRFI7UUFFRSxHQUFBLEVBQUssT0FGUDtRQUdFLFFBQUEsRUFBVSxxQ0FIWjtRQUlFLFlBQUEsRUFBYyxxQ0FKaEI7UUFLRSxPQUFBLEVBQVM7VUFDUCxLQUFBLEVBQU8sU0FBQyxJQUFEO21CQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsdUJBQVgsQ0FBb0MsQ0FBQSxDQUFBO1VBQTlDLENBREE7U0FMWDtPQURXOzs7Z0NBWWIsT0FBQSxHQUFTO01BQ1AsT0FBQSxFQUFTLElBREY7OztnQ0FJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFPLG9CQUFQLEVBQTZCLE9BQTdCO01BQ0EsS0FBQSxHQUFRLElBQUMsQ0FBQSxHQUFELENBQUssT0FBTDtNQUVSLFVBQUEsR0FBYSxPQUFPLENBQUM7TUFDckIsaUJBQUEsR0FBb0IsT0FBTyxDQUFDO01BRTVCLElBQUcsQ0FBSSxpQkFBUDtRQUNFLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixxQ0FBeEIsRUFEdEI7O01BR0EsSUFBQyxDQUFBLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixxQkFBQSxHQUF3QixpQkFBckQ7TUFFQSxJQUFBLEdBQU8sQ0FDTCxTQURLLEVBRUwsSUFGSyxFQUdMLGlCQUhLLEVBSUwsSUFKSyxFQUtMLHlCQUxLLEVBTUwsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQU5OO01BU1AsSUFBRyxVQUFIO1FBQ0UsSUFBQyxDQUFBLDRCQUFELENBQThCLE9BQTlCLEVBQXVDLFlBQXZDLEVBQXFELE1BQXJEO2VBQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLEVBQWlCLElBQWpCLEVBQXVCO1VBQUMsZ0JBQUEsRUFBa0IsS0FBbkI7U0FBdkIsQ0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSLEVBRkY7T0FBQSxNQUFBO2VBT0UsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLEVBQWdCO1VBQUMsZ0JBQUEsRUFBa0IsS0FBbkI7U0FBaEIsQ0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSLEVBUEY7O0lBckJROzs7O0tBbkJxQztBQVJqRCIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly93d3cuZ251Lm9yZy9zb2Z0d2FyZS9lbWFjcy9cbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4uL2JlYXV0aWZpZXInKVxucGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRm9ydHJhbkJlYXV0aWZpZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiRm9ydHJhbiBCZWF1dGlmaWVyXCJcbiAgbGluazogXCJodHRwczovL3d3dy5nbnUub3JnL3NvZnR3YXJlL2VtYWNzL1wiXG4gIGV4ZWN1dGFibGVzOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJFbWFjc1wiXG4gICAgICBjbWQ6IFwiZW1hY3NcIlxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cHM6Ly93d3cuZ251Lm9yZy9zb2Z0d2FyZS9lbWFjcy9cIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvZW1hY3MvXCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC9FbWFjcyAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXG4gICAgICB9XG4gICAgfVxuICBdXG5cbiAgb3B0aW9uczoge1xuICAgIEZvcnRyYW46IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQGRlYnVnKCdmb3J0cmFuLWJlYXV0aWZpZXInLCBvcHRpb25zKVxuICAgIGVtYWNzID0gQGV4ZShcImVtYWNzXCIpXG5cbiAgICBlbWFjc19wYXRoID0gb3B0aW9ucy5lbWFjc19wYXRoXG4gICAgZW1hY3Nfc2NyaXB0X3BhdGggPSBvcHRpb25zLmVtYWNzX3NjcmlwdF9wYXRoXG5cbiAgICBpZiBub3QgZW1hY3Nfc2NyaXB0X3BhdGhcbiAgICAgIGVtYWNzX3NjcmlwdF9wYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJlbWFjcy1mb3J0cmFuLWZvcm1hdGluZy1zY3JpcHQubGlzcFwiKVxuXG4gICAgQGRlYnVnKCdmb3J0cmFuLWJlYXV0aWZpZXInLCAnZW1hY3Mgc2NyaXB0IHBhdGg6ICcgKyBlbWFjc19zY3JpcHRfcGF0aClcbiAgICBcbiAgICBhcmdzID0gW1xuICAgICAgJy0tYmF0Y2gnXG4gICAgICAnLWwnXG4gICAgICBlbWFjc19zY3JpcHRfcGF0aFxuICAgICAgJy1mJ1xuICAgICAgJ2Y5MC1iYXRjaC1pbmRlbnQtcmVnaW9uJ1xuICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICBdXG5cbiAgICBpZiBlbWFjc19wYXRoXG4gICAgICBAZGVwcmVjYXRlT3B0aW9uRm9yRXhlY3V0YWJsZShcIkVtYWNzXCIsIFwiZW1hY3NfcGF0aFwiLCBcIlBhdGhcIilcbiAgICAgIEBydW4oZW1hY3NfcGF0aCwgYXJncywge2lnbm9yZVJldHVybkNvZGU6IGZhbHNlfSlcbiAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgIClcbiAgICBlbHNlXG4gICAgICBlbWFjcy5ydW4oYXJncywge2lnbm9yZVJldHVybkNvZGU6IGZhbHNlfSlcbiAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgIClcbiJdfQ==
