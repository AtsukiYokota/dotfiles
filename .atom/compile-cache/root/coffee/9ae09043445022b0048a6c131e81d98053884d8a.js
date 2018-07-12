
/*
Requires https://github.com/andialbrecht/sqlparse
 */

(function() {
  "use strict";
  var Beautifier, Sqlformat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Sqlformat = (function(superClass) {
    extend(Sqlformat, superClass);

    function Sqlformat() {
      return Sqlformat.__super__.constructor.apply(this, arguments);
    }

    Sqlformat.prototype.name = "sqlformat";

    Sqlformat.prototype.link = "https://github.com/andialbrecht/sqlparse";

    Sqlformat.prototype.isPreInstalled = false;

    Sqlformat.prototype.options = {
      SQL: true
    };

    Sqlformat.prototype.beautify = function(text, language, options) {
      return this.run("sqlformat", [this.tempFile("input", text), options.reindent === true ? "--reindent" : void 0, options.indent_size != null ? "--indent_width=" + options.indent_size : void 0, ((options.keywords != null) && options.keywords !== 'unchanged') ? "--keywords=" + options.keywords : void 0, ((options.identifiers != null) && options.identifiers !== 'unchanged') ? "--identifiers=" + options.identifiers : void 0], {
        help: {
          link: "https://github.com/andialbrecht/sqlparse"
        }
      });
    };

    return Sqlformat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3NxbGZvcm1hdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEscUJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3dCQUNyQixJQUFBLEdBQU07O3dCQUNOLElBQUEsR0FBTTs7d0JBQ04sY0FBQSxHQUFnQjs7d0JBRWhCLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFBSyxJQURFOzs7d0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLFdBQUwsRUFBa0IsQ0FDaEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRGdCLEVBRUEsT0FBTyxDQUFDLFFBQVIsS0FBb0IsSUFBcEMsR0FBQSxZQUFBLEdBQUEsTUFGZ0IsRUFHMkIsMkJBQTNDLEdBQUEsaUJBQUEsR0FBa0IsT0FBTyxDQUFDLFdBQTFCLEdBQUEsTUFIZ0IsRUFJb0IsQ0FBQywwQkFBQSxJQUFxQixPQUFPLENBQUMsUUFBUixLQUFvQixXQUExQyxDQUFwQyxHQUFBLGFBQUEsR0FBYyxPQUFPLENBQUMsUUFBdEIsR0FBQSxNQUpnQixFQUswQixDQUFDLDZCQUFBLElBQXdCLE9BQU8sQ0FBQyxXQUFSLEtBQXVCLFdBQWhELENBQTFDLEdBQUEsZ0JBQUEsR0FBaUIsT0FBTyxDQUFDLFdBQXpCLEdBQUEsTUFMZ0IsQ0FBbEIsRUFNSztRQUFBLElBQUEsRUFBTTtVQUNQLElBQUEsRUFBTSwwQ0FEQztTQUFOO09BTkw7SUFEUTs7OztLQVQ2QjtBQVB6QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL2FuZGlhbGJyZWNodC9zcWxwYXJzZVxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTcWxmb3JtYXQgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwic3FsZm9ybWF0XCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYW5kaWFsYnJlY2h0L3NxbHBhcnNlXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFNRTDogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAcnVuKFwic3FsZm9ybWF0XCIsIFtcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBcIi0tcmVpbmRlbnRcIiBpZiBvcHRpb25zLnJlaW5kZW50IGlzIHRydWVcbiAgICAgIFwiLS1pbmRlbnRfd2lkdGg9I3tvcHRpb25zLmluZGVudF9zaXplfVwiIGlmIG9wdGlvbnMuaW5kZW50X3NpemU/XG4gICAgICBcIi0ta2V5d29yZHM9I3tvcHRpb25zLmtleXdvcmRzfVwiIGlmIChvcHRpb25zLmtleXdvcmRzPyAmJiBvcHRpb25zLmtleXdvcmRzICE9ICd1bmNoYW5nZWQnKVxuICAgICAgXCItLWlkZW50aWZpZXJzPSN7b3B0aW9ucy5pZGVudGlmaWVyc31cIiBpZiAob3B0aW9ucy5pZGVudGlmaWVycz8gJiYgb3B0aW9ucy5pZGVudGlmaWVycyAhPSAndW5jaGFuZ2VkJylcbiAgICAgIF0sIGhlbHA6IHtcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYW5kaWFsYnJlY2h0L3NxbHBhcnNlXCJcbiAgICAgIH0pXG4iXX0=
