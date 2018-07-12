
/*
Requires [dfmt](https://github.com/Hackerpilot/dfmt)
 */

(function() {
  "use strict";
  var Beautifier, Dfmt,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Dfmt = (function(superClass) {
    extend(Dfmt, superClass);

    function Dfmt() {
      return Dfmt.__super__.constructor.apply(this, arguments);
    }

    Dfmt.prototype.name = "dfmt";

    Dfmt.prototype.link = "https://github.com/Hackerpilot/dfmt";

    Dfmt.prototype.executables = [
      {
        name: "Dfmt",
        cmd: "dfmt",
        homepage: "https://github.com/Hackerpilot/dfmt",
        installation: "https://github.com/dlang-community/dfmt#building"
      }
    ];

    Dfmt.prototype.options = {
      D: false
    };

    Dfmt.prototype.beautify = function(text, language, options) {
      return this.exe("dfmt").run([this.tempFile("input", text)]);
    };

    return Dfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2RmbXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBR0E7QUFIQSxNQUFBLGdCQUFBO0lBQUE7OztFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzttQkFDckIsSUFBQSxHQUFNOzttQkFDTixJQUFBLEdBQU07O21CQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLE1BRFI7UUFFRSxHQUFBLEVBQUssTUFGUDtRQUdFLFFBQUEsRUFBVSxxQ0FIWjtRQUlFLFlBQUEsRUFBYyxrREFKaEI7T0FEVzs7O21CQVNiLE9BQUEsR0FBUztNQUNQLENBQUEsRUFBRyxLQURJOzs7bUJBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsQ0FBWSxDQUFDLEdBQWIsQ0FBaUIsQ0FDZixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FEZSxDQUFqQjtJQURROzs7O0tBaEJ3QjtBQU5wQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgW2RmbXRdKGh0dHBzOi8vZ2l0aHViLmNvbS9IYWNrZXJwaWxvdC9kZm10KVxuIyMjXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRGZtdCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJkZm10XCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vSGFja2VycGlsb3QvZGZtdFwiXG4gIGV4ZWN1dGFibGVzOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJEZm10XCJcbiAgICAgIGNtZDogXCJkZm10XCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9IYWNrZXJwaWxvdC9kZm10XCJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2dpdGh1Yi5jb20vZGxhbmctY29tbXVuaXR5L2RmbXQjYnVpbGRpbmdcIlxuICAgIH1cbiAgXVxuXG4gIG9wdGlvbnM6IHtcbiAgICBEOiBmYWxzZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAZXhlKFwiZGZtdFwiKS5ydW4oW1xuICAgICAgQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICAgIF0pXG4iXX0=
