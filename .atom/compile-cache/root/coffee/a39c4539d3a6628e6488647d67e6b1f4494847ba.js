
/*
Requires https://www.gnu.org/software/emacs/
 */

(function() {
  "use strict";
  var Beautifier, VhdlBeautifier, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('../beautifier');

  path = require("path");

  module.exports = VhdlBeautifier = (function(superClass) {
    extend(VhdlBeautifier, superClass);

    function VhdlBeautifier() {
      return VhdlBeautifier.__super__.constructor.apply(this, arguments);
    }

    VhdlBeautifier.prototype.name = "VHDL Beautifier";

    VhdlBeautifier.prototype.link = "https://www.gnu.org/software/emacs/";

    VhdlBeautifier.prototype.executables = [
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

    VhdlBeautifier.prototype.options = {
      VHDL: {
        emacs_script_path: true
      }
    };

    VhdlBeautifier.prototype.beautify = function(text, language, options) {
      var args, emacs, emacs_script_path, tempFile;
      this.debug('vhdl-beautifier', options);
      emacs = this.exe("emacs");
      emacs_script_path = options.emacs_script_path;
      if (!emacs_script_path) {
        emacs_script_path = path.resolve(__dirname, "emacs-vhdl-formating-script.lisp");
      }
      this.debug('vhdl-beautifier', 'emacs script path: ' + emacs_script_path);
      args = ['--batch', '-l', emacs_script_path, '-f', 'vhdl-batch-indent-region', tempFile = this.tempFile("temp", text)];
      return emacs.run(args, {
        ignoreReturnCode: false
      }).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return VhdlBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3ZoZGwtYmVhdXRpZmllci9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsZ0NBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozs2QkFDckIsSUFBQSxHQUFNOzs2QkFDTixJQUFBLEdBQU07OzZCQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLE9BRFI7UUFFRSxHQUFBLEVBQUssT0FGUDtRQUdFLFFBQUEsRUFBVSxxQ0FIWjtRQUlFLFlBQUEsRUFBYyxxQ0FKaEI7UUFLRSxPQUFBLEVBQVM7VUFDUCxLQUFBLEVBQU8sU0FBQyxJQUFEO21CQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsdUJBQVgsQ0FBb0MsQ0FBQSxDQUFBO1VBQTlDLENBREE7U0FMWDtPQURXOzs7NkJBWWIsT0FBQSxHQUFTO01BQ1AsSUFBQSxFQUFNO1FBQ0osaUJBQUEsRUFBbUIsSUFEZjtPQURDOzs7NkJBTVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxpQkFBUCxFQUEwQixPQUExQjtNQUNBLEtBQUEsR0FBUSxJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUw7TUFFUixpQkFBQSxHQUFvQixPQUFPLENBQUM7TUFFNUIsSUFBRyxDQUFJLGlCQUFQO1FBQ0UsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLGtDQUF4QixFQUR0Qjs7TUFHQSxJQUFDLENBQUEsS0FBRCxDQUFPLGlCQUFQLEVBQTBCLHFCQUFBLEdBQXdCLGlCQUFsRDtNQUVBLElBQUEsR0FBTyxDQUNMLFNBREssRUFFTCxJQUZLLEVBR0wsaUJBSEssRUFJTCxJQUpLLEVBS0wsMEJBTEssRUFNTCxRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBTk47YUFTUCxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsRUFBZ0I7UUFBQyxnQkFBQSxFQUFrQixLQUFuQjtPQUFoQixDQUNFLENBQUMsSUFESCxDQUNRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEUjtJQXBCUTs7OztLQXJCa0M7QUFSOUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvZW1hY3MvXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuLi9iZWF1dGlmaWVyJylcbnBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFZoZGxCZWF1dGlmaWVyIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlZIREwgQmVhdXRpZmllclwiXG4gIGxpbms6IFwiaHR0cHM6Ly93d3cuZ251Lm9yZy9zb2Z0d2FyZS9lbWFjcy9cIlxuICBleGVjdXRhYmxlczogW1xuICAgIHtcbiAgICAgIG5hbWU6IFwiRW1hY3NcIlxuICAgICAgY21kOiBcImVtYWNzXCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvZW1hY3MvXCJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL3d3dy5nbnUub3JnL3NvZnR3YXJlL2VtYWNzL1wiXG4gICAgICB2ZXJzaW9uOiB7XG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5tYXRjaCgvRW1hY3MgKFxcZCtcXC5cXGQrXFwuXFxkKykvKVsxXVxuICAgICAgfVxuICAgIH1cbiAgXVxuXG4gIG9wdGlvbnM6IHtcbiAgICBWSERMOiB7XG4gICAgICBlbWFjc19zY3JpcHRfcGF0aDogdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQGRlYnVnKCd2aGRsLWJlYXV0aWZpZXInLCBvcHRpb25zKVxuICAgIGVtYWNzID0gQGV4ZShcImVtYWNzXCIpXG5cbiAgICBlbWFjc19zY3JpcHRfcGF0aCA9IG9wdGlvbnMuZW1hY3Nfc2NyaXB0X3BhdGhcblxuICAgIGlmIG5vdCBlbWFjc19zY3JpcHRfcGF0aFxuICAgICAgZW1hY3Nfc2NyaXB0X3BhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImVtYWNzLXZoZGwtZm9ybWF0aW5nLXNjcmlwdC5saXNwXCIpXG5cbiAgICBAZGVidWcoJ3ZoZGwtYmVhdXRpZmllcicsICdlbWFjcyBzY3JpcHQgcGF0aDogJyArIGVtYWNzX3NjcmlwdF9wYXRoKVxuXG4gICAgYXJncyA9IFtcbiAgICAgICctLWJhdGNoJ1xuICAgICAgJy1sJ1xuICAgICAgZW1hY3Nfc2NyaXB0X3BhdGhcbiAgICAgICctZidcbiAgICAgICd2aGRsLWJhdGNoLWluZGVudC1yZWdpb24nXG4gICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dClcbiAgICAgIF1cblxuICAgIGVtYWNzLnJ1bihhcmdzLCB7aWdub3JlUmV0dXJuQ29kZTogZmFsc2V9KVxuICAgICAgLnRoZW4oPT5cbiAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgKVxuIl19
