
/*
Requires http://hhvm.com/
 */

(function() {
  "use strict";
  var Beautifier, HhFormat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = HhFormat = (function(superClass) {
    extend(HhFormat, superClass);

    function HhFormat() {
      return HhFormat.__super__.constructor.apply(this, arguments);
    }

    HhFormat.prototype.name = "hh_format";

    HhFormat.prototype.link = "http://hhvm.com/";

    HhFormat.prototype.isPreInstalled = false;

    HhFormat.prototype.options = {
      PHP: false
    };

    HhFormat.prototype.beautify = function(text, language, options) {
      return this.run("hh_format", [this.tempFile("input", text)], {
        help: {
          link: "http://hhvm.com/"
        }
      }).then(function(output) {
        if (output.trim()) {
          return output;
        } else {
          return this.Promise.resolve(new Error("hh_format returned an empty output."));
        }
      });
    };

    return HhFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2hoX2Zvcm1hdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsb0JBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3VCQUNyQixJQUFBLEdBQU07O3VCQUNOLElBQUEsR0FBTTs7dUJBQ04sY0FBQSxHQUFnQjs7dUJBRWhCLE9BQUEsR0FDRTtNQUFBLEdBQUEsRUFBSyxLQUFMOzs7dUJBRUYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLFdBQUwsRUFBa0IsQ0FDaEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRGdCLENBQWxCLEVBR0E7UUFDRSxJQUFBLEVBQU07VUFDSixJQUFBLEVBQU0sa0JBREY7U0FEUjtPQUhBLENBT0UsQ0FBQyxJQVBILENBT1EsU0FBQyxNQUFEO1FBR04sSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFBLENBQUg7aUJBQ0UsT0FERjtTQUFBLE1BQUE7aUJBR0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLElBQUksS0FBSixDQUFVLHFDQUFWLENBQWpCLEVBSEY7O01BSE0sQ0FQUjtJQURROzs7O0tBUjRCO0FBUHhDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwOi8vaGh2bS5jb20vXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEhoRm9ybWF0IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcImhoX2Zvcm1hdFwiXG4gIGxpbms6IFwiaHR0cDovL2hodm0uY29tL1wiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6XG4gICAgUEhQOiBmYWxzZVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQHJ1bihcImhoX2Zvcm1hdFwiLCBbXG4gICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KVxuICAgIF0sXG4gICAge1xuICAgICAgaGVscDoge1xuICAgICAgICBsaW5rOiBcImh0dHA6Ly9oaHZtLmNvbS9cIlxuICAgICAgfVxuICAgIH0pLnRoZW4oKG91dHB1dCkgLT5cbiAgICAgICMgaGhfZm9ybWF0IGNhbiBleGl0IHdpdGggc3RhdHVzIDAgYW5kIG5vIG91dHB1dCBmb3Igc29tZSBmaWxlcyB3aGljaFxuICAgICAgIyBpdCBkb2Vzbid0IGZvcm1hdC4gIEluIHRoYXQgY2FzZSB3ZSBqdXN0IHJldHVybiBvcmlnaW5hbCB0ZXh0LlxuICAgICAgaWYgb3V0cHV0LnRyaW0oKVxuICAgICAgICBvdXRwdXRcbiAgICAgIGVsc2VcbiAgICAgICAgQFByb21pc2UucmVzb2x2ZShuZXcgRXJyb3IoXCJoaF9mb3JtYXQgcmV0dXJuZWQgYW4gZW1wdHkgb3V0cHV0LlwiKSlcbiAgICApXG4iXX0=
