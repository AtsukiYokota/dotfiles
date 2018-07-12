
/*
Requires emacs with verilog-mode https://www.veripool.org/wiki/verilog-mode
 */

(function() {
  "use strict";
  var Beautifier, EmacsVerilogMode, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('../beautifier');

  path = require("path");

  module.exports = EmacsVerilogMode = (function(superClass) {
    extend(EmacsVerilogMode, superClass);

    function EmacsVerilogMode() {
      return EmacsVerilogMode.__super__.constructor.apply(this, arguments);
    }

    EmacsVerilogMode.prototype.name = "Emacs Verilog Mode";

    EmacsVerilogMode.prototype.link = "https://www.veripool.org/projects/verilog-mode/";

    EmacsVerilogMode.prototype.isPreInstalled = false;

    EmacsVerilogMode.prototype.executables = [
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

    EmacsVerilogMode.prototype.options = {
      Verilog: {
        emacs_script_path: true
      }
    };

    EmacsVerilogMode.prototype.beautify = function(text, language, options) {
      var args, emacs_script_path, tempFile;
      emacs_script_path = options.emacs_script_path;
      if (!emacs_script_path) {
        emacs_script_path = path.resolve(__dirname, "verilog-mode.el");
      }
      this.debug('verilog-beautifier', 'emacs script path: ' + emacs_script_path);
      tempFile = this.tempFile("input", text);
      args = ["--batch", tempFile, "-l", emacs_script_path, "-f", "verilog-mode", "-f", "verilog-batch-indent"];
      this.debug('verilog-beautifier', 'emacs args: ' + args);
      return this.exe("emacs").run(args, {
        ignoreReturnCode: false
      }).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return EmacsVerilogMode;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3Zlcmlsb2ctbW9kZS9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsa0NBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzsrQkFDckIsSUFBQSxHQUFNOzsrQkFDTixJQUFBLEdBQU07OytCQUNOLGNBQUEsR0FBZ0I7OytCQUNoQixXQUFBLEdBQWE7TUFDWDtRQUNFLElBQUEsRUFBTSxPQURSO1FBRUUsR0FBQSxFQUFLLE9BRlA7UUFHRSxRQUFBLEVBQVUscUNBSFo7UUFJRSxZQUFBLEVBQWMscUNBSmhCO1FBS0UsT0FBQSxFQUFTO1VBQ1AsS0FBQSxFQUFPLFNBQUMsSUFBRDttQkFBVSxJQUFJLENBQUMsS0FBTCxDQUFXLHVCQUFYLENBQW9DLENBQUEsQ0FBQTtVQUE5QyxDQURBO1NBTFg7T0FEVzs7OytCQVliLE9BQUEsR0FBUztNQUNQLE9BQUEsRUFBUztRQUNQLGlCQUFBLEVBQW1CLElBRFo7T0FERjs7OytCQU1ULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLGlCQUFBLEdBQW9CLE9BQU8sQ0FBQztNQUU1QixJQUFHLENBQUksaUJBQVA7UUFDRSxpQkFBQSxHQUFvQixJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsaUJBQXhCLEVBRHRCOztNQUdBLElBQUMsQ0FBQSxLQUFELENBQU8sb0JBQVAsRUFBNkIscUJBQUEsR0FBd0IsaUJBQXJEO01BRUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQjtNQUVYLElBQUEsR0FBTyxDQUNMLFNBREssRUFFTCxRQUZLLEVBR0wsSUFISyxFQUlMLGlCQUpLLEVBS0wsSUFMSyxFQU1MLGNBTkssRUFPTCxJQVBLLEVBUUwsc0JBUks7TUFXUCxJQUFDLENBQUEsS0FBRCxDQUFPLG9CQUFQLEVBQTZCLGNBQUEsR0FBaUIsSUFBOUM7YUFFQSxJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsQ0FBYSxDQUFDLEdBQWQsQ0FBa0IsSUFBbEIsRUFBd0I7UUFBQyxnQkFBQSxFQUFrQixLQUFuQjtPQUF4QixDQUNFLENBQUMsSUFESCxDQUNRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEUjtJQXZCUTs7OztLQXRCb0M7QUFSaEQiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGVtYWNzIHdpdGggdmVyaWxvZy1tb2RlIGh0dHBzOi8vd3d3LnZlcmlwb29sLm9yZy93aWtpL3Zlcmlsb2ctbW9kZVxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZShcInBhdGhcIilcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBFbWFjc1Zlcmlsb2dNb2RlIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIkVtYWNzIFZlcmlsb2cgTW9kZVwiXG4gIGxpbms6IFwiaHR0cHM6Ly93d3cudmVyaXBvb2wub3JnL3Byb2plY3RzL3Zlcmlsb2ctbW9kZS9cIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcbiAgZXhlY3V0YWJsZXM6IFtcbiAgICB7XG4gICAgICBuYW1lOiBcIkVtYWNzXCJcbiAgICAgIGNtZDogXCJlbWFjc1wiXG4gICAgICBob21lcGFnZTogXCJodHRwczovL3d3dy5nbnUub3JnL3NvZnR3YXJlL2VtYWNzL1wiXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cHM6Ly93d3cuZ251Lm9yZy9zb2Z0d2FyZS9lbWFjcy9cIlxuICAgICAgdmVyc2lvbjoge1xuICAgICAgICBwYXJzZTogKHRleHQpIC0+IHRleHQubWF0Y2goL0VtYWNzIChcXGQrXFwuXFxkK1xcLlxcZCspLylbMV1cbiAgICAgIH1cbiAgICB9XG4gIF1cblxuICBvcHRpb25zOiB7XG4gICAgVmVyaWxvZzoge1xuICAgICAgZW1hY3Nfc2NyaXB0X3BhdGg6IHRydWVcbiAgICB9XG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIGVtYWNzX3NjcmlwdF9wYXRoID0gb3B0aW9ucy5lbWFjc19zY3JpcHRfcGF0aFxuXG4gICAgaWYgbm90IGVtYWNzX3NjcmlwdF9wYXRoXG4gICAgICBlbWFjc19zY3JpcHRfcGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwidmVyaWxvZy1tb2RlLmVsXCIpXG5cbiAgICBAZGVidWcoJ3Zlcmlsb2ctYmVhdXRpZmllcicsICdlbWFjcyBzY3JpcHQgcGF0aDogJyArIGVtYWNzX3NjcmlwdF9wYXRoKVxuXG4gICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KVxuXG4gICAgYXJncyA9IFtcbiAgICAgIFwiLS1iYXRjaFwiXG4gICAgICB0ZW1wRmlsZVxuICAgICAgXCItbFwiXG4gICAgICBlbWFjc19zY3JpcHRfcGF0aFxuICAgICAgXCItZlwiXG4gICAgICBcInZlcmlsb2ctbW9kZVwiXG4gICAgICBcIi1mXCJcbiAgICAgIFwidmVyaWxvZy1iYXRjaC1pbmRlbnRcIlxuICAgICAgXVxuXG4gICAgQGRlYnVnKCd2ZXJpbG9nLWJlYXV0aWZpZXInLCAnZW1hY3MgYXJnczogJyArIGFyZ3MpXG5cbiAgICBAZXhlKFwiZW1hY3NcIikucnVuKGFyZ3MsIHtpZ25vcmVSZXR1cm5Db2RlOiBmYWxzZX0pXG4gICAgICAudGhlbig9PlxuICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICApXG4iXX0=
