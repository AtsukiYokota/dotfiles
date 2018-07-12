(function() {
  "use strict";
  var BashBeautify, Beautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = BashBeautify = (function(superClass) {
    extend(BashBeautify, superClass);

    function BashBeautify() {
      return BashBeautify.__super__.constructor.apply(this, arguments);
    }

    BashBeautify.prototype.name = "beautysh";

    BashBeautify.prototype.link = "https://github.com/bemeurer/beautysh";

    BashBeautify.prototype.executables = [
      {
        name: "beautysh",
        cmd: "beautysh",
        homepage: "https://github.com/bemeurer/beautysh",
        installation: "https://github.com/bemeurer/beautysh#installation",
        version: {
          args: ['--help'],
          parse: function(text) {
            return text.indexOf("usage: beautysh") !== -1 && "0.0.0";
          }
        },
        docker: {
          image: "unibeautify/beautysh"
        }
      }
    ];

    BashBeautify.prototype.options = {
      Bash: {
        indent_size: true,
        indent_with_tabs: true
      }
    };

    BashBeautify.prototype.beautify = function(text, language, options) {
      var beautysh, file, tabs;
      beautysh = this.exe("beautysh");
      file = this.tempFile("input", text);
      tabs = options.indent_with_tabs;
      if (tabs === true) {
        return beautysh.run(['-t', '-f', file]).then((function(_this) {
          return function() {
            return _this.readFile(file);
          };
        })(this));
      } else {
        return beautysh.run(['-i', options.indent_size, '-f', file]).then((function(_this) {
          return function() {
            return _this.readFile(file);
          };
        })(this));
      }
    };

    return BashBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2JlYXV0eXNoLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSx3QkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7MkJBQ3JCLElBQUEsR0FBTTs7MkJBQ04sSUFBQSxHQUFNOzsyQkFDTixXQUFBLEdBQWE7TUFDWDtRQUNFLElBQUEsRUFBTSxVQURSO1FBRUUsR0FBQSxFQUFLLFVBRlA7UUFHRSxRQUFBLEVBQVUsc0NBSFo7UUFJRSxZQUFBLEVBQWMsbURBSmhCO1FBS0UsT0FBQSxFQUFTO1VBRVAsSUFBQSxFQUFNLENBQUMsUUFBRCxDQUZDO1VBR1AsS0FBQSxFQUFPLFNBQUMsSUFBRDttQkFBVSxJQUFJLENBQUMsT0FBTCxDQUFhLGlCQUFiLENBQUEsS0FBcUMsQ0FBQyxDQUF0QyxJQUE0QztVQUF0RCxDQUhBO1NBTFg7UUFVRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8sc0JBREQ7U0FWVjtPQURXOzs7MkJBaUJiLE9BQUEsR0FBUztNQUNQLElBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxJQUFiO1FBQ0EsZ0JBQUEsRUFBa0IsSUFEbEI7T0FGSzs7OzJCQU1ULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUw7TUFDWCxJQUFBLEdBQU8sSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CO01BQ1AsSUFBQSxHQUFPLE9BQU8sQ0FBQztNQUNmLElBQUcsSUFBQSxLQUFRLElBQVg7ZUFDRSxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUUsSUFBRixFQUFRLElBQVIsRUFBYyxJQUFkLENBQWIsQ0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxRQUFELENBQVUsSUFBVjtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSLEVBREY7T0FBQSxNQUFBO2VBSUUsUUFBUSxDQUFDLEdBQVQsQ0FBYSxDQUFFLElBQUYsRUFBUSxPQUFPLENBQUMsV0FBaEIsRUFBNkIsSUFBN0IsRUFBbUMsSUFBbkMsQ0FBYixDQUNFLENBQUMsSUFESCxDQUNRLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFIsRUFKRjs7SUFKUTs7OztLQTFCZ0M7QUFINUMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQmFzaEJlYXV0aWZ5IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcImJlYXV0eXNoXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYmVtZXVyZXIvYmVhdXR5c2hcIlxuICBleGVjdXRhYmxlczogW1xuICAgIHtcbiAgICAgIG5hbWU6IFwiYmVhdXR5c2hcIlxuICAgICAgY21kOiBcImJlYXV0eXNoXCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iZW1ldXJlci9iZWF1dHlzaFwiXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cHM6Ly9naXRodWIuY29tL2JlbWV1cmVyL2JlYXV0eXNoI2luc3RhbGxhdGlvblwiXG4gICAgICB2ZXJzaW9uOiB7XG4gICAgICAgICMgRG9lcyBub3QgZGlzcGxheSB2ZXJzaW9uXG4gICAgICAgIGFyZ3M6IFsnLS1oZWxwJ10sXG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5pbmRleE9mKFwidXNhZ2U6IGJlYXV0eXNoXCIpIGlzbnQgLTEgYW5kIFwiMC4wLjBcIlxuICAgICAgfVxuICAgICAgZG9ja2VyOiB7XG4gICAgICAgIGltYWdlOiBcInVuaWJlYXV0aWZ5L2JlYXV0eXNoXCJcbiAgICAgIH1cbiAgICB9XG4gIF1cblxuICBvcHRpb25zOiB7XG4gICAgQmFzaDpcbiAgICAgIGluZGVudF9zaXplOiB0cnVlXG4gICAgICBpbmRlbnRfd2l0aF90YWJzOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIGJlYXV0eXNoID0gQGV4ZShcImJlYXV0eXNoXCIpXG4gICAgZmlsZSA9IEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgdGFicyA9IG9wdGlvbnMuaW5kZW50X3dpdGhfdGFic1xuICAgIGlmIHRhYnMgaXMgdHJ1ZVxuICAgICAgYmVhdXR5c2gucnVuKFsgJy10JywgJy1mJywgZmlsZSBdKVxuICAgICAgICAudGhlbig9PiBAcmVhZEZpbGUgZmlsZSlcbiAgICBlbHNlXG4gICAgICBiZWF1dHlzaC5ydW4oWyAnLWknLCBvcHRpb25zLmluZGVudF9zaXplLCAnLWYnLCBmaWxlIF0pXG4gICAgICAgIC50aGVuKD0+IEByZWFkRmlsZSBmaWxlKVxuIl19
