(function() {
  "use strict";
  var Beautifier, PugBeautify,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PugBeautify = (function(superClass) {
    extend(PugBeautify, superClass);

    function PugBeautify() {
      return PugBeautify.__super__.constructor.apply(this, arguments);
    }

    PugBeautify.prototype.name = "Pug Beautify";

    PugBeautify.prototype.link = "https://github.com/vingorius/pug-beautify";

    PugBeautify.prototype.options = {
      Jade: {
        fill_tab: [
          'indent_char', function(indent_char) {
            return indent_char === "\t";
          }
        ],
        omit_div: true,
        tab_size: "indent_size"
      }
    };

    PugBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var error, pugBeautify;
        pugBeautify = require("pug-beautify");
        try {
          return resolve(pugBeautify(text, options));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return PugBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3B1Zy1iZWF1dGlmeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTs7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzBCQUNyQixJQUFBLEdBQU07OzBCQUNOLElBQUEsR0FBTTs7MEJBQ04sT0FBQSxHQUFTO01BRVAsSUFBQSxFQUNFO1FBQUEsUUFBQSxFQUFVO1VBQUMsYUFBRCxFQUFnQixTQUFDLFdBQUQ7QUFFeEIsbUJBQVEsV0FBQSxLQUFlO1VBRkMsQ0FBaEI7U0FBVjtRQUlBLFFBQUEsRUFBVSxJQUpWO1FBS0EsUUFBQSxFQUFVLGFBTFY7T0FISzs7OzBCQVdULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBRVIsYUFBTyxJQUFJLElBQUMsQ0FBQSxPQUFMLENBQWEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixZQUFBO1FBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxjQUFSO0FBQ2Q7aUJBQ0UsT0FBQSxDQUFRLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLE9BQWxCLENBQVIsRUFERjtTQUFBLGNBQUE7VUFFTTtpQkFFSixNQUFBLENBQU8sS0FBUCxFQUpGOztNQUZrQixDQUFiO0lBRkM7Ozs7S0FkK0I7QUFIM0MiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHVnQmVhdXRpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiUHVnIEJlYXV0aWZ5XCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vdmluZ29yaXVzL3B1Zy1iZWF1dGlmeVwiXG4gIG9wdGlvbnM6IHtcbiAgICAjIEFwcGx5IHRoZXNlIG9wdGlvbnMgZmlyc3QgLyBnbG9iYWxseSwgZm9yIGFsbCBsYW5ndWFnZXNcbiAgICBKYWRlOlxuICAgICAgZmlsbF90YWI6IFsnaW5kZW50X2NoYXInLCAoaW5kZW50X2NoYXIpIC0+XG4gICAgICAgICMgU2hvdWxkIHVzZSB0YWJzP1xuICAgICAgICByZXR1cm4gKGluZGVudF9jaGFyIGlzIFwiXFx0XCIpXG4gICAgICBdXG4gICAgICBvbWl0X2RpdjogdHJ1ZVxuICAgICAgdGFiX3NpemU6IFwiaW5kZW50X3NpemVcIlxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cblxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIHB1Z0JlYXV0aWZ5ID0gcmVxdWlyZShcInB1Zy1iZWF1dGlmeVwiKVxuICAgICAgdHJ5XG4gICAgICAgIHJlc29sdmUocHVnQmVhdXRpZnkodGV4dCwgb3B0aW9ucykpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIEVycm9yIG9jY3VycmVkXG4gICAgICAgIHJlamVjdChlcnJvcilcbiAgICApXG4iXX0=
