(function() {
  "use strict";
  var Beautifier, MarkoBeautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = MarkoBeautifier = (function(superClass) {
    extend(MarkoBeautifier, superClass);

    function MarkoBeautifier() {
      return MarkoBeautifier.__super__.constructor.apply(this, arguments);
    }

    MarkoBeautifier.prototype.name = 'Marko Beautifier';

    MarkoBeautifier.prototype.link = "https://github.com/marko-js/marko-prettyprint";

    MarkoBeautifier.prototype.options = {
      Marko: true
    };

    MarkoBeautifier.prototype.beautify = function(text, language, options, context) {
      return new this.Promise(function(resolve, reject) {
        var error, i, indent, indent_char, indent_size, j, markoPrettyprint, prettyprintOptions, ref;
        markoPrettyprint = require('marko-prettyprint');
        indent_char = options.indent_char || ' ';
        indent_size = options.indent_size || 4;
        indent = '';
        for (i = j = 0, ref = indent_size - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
          indent += indent_char;
        }
        prettyprintOptions = {
          syntax: options.syntax,
          filename: (context != null) && (context.filePath != null) ? context.filePath : require.resolve('marko-prettyprint'),
          indent: indent
        };
        try {
          return resolve(markoPrettyprint(text, prettyprintOptions));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return MarkoBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL21hcmtvLWJlYXV0aWZpZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLDJCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozs4QkFFckIsSUFBQSxHQUFNOzs4QkFDTixJQUFBLEdBQU07OzhCQUVOLE9BQUEsR0FDRTtNQUFBLEtBQUEsRUFBTyxJQUFQOzs7OEJBRUYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFFUixhQUFPLElBQUksSUFBQyxDQUFBLE9BQUwsQ0FBYSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2xCLFlBQUE7UUFBQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsbUJBQVI7UUFFbkIsV0FBQSxHQUFjLE9BQU8sQ0FBQyxXQUFSLElBQXVCO1FBQ3JDLFdBQUEsR0FBYyxPQUFPLENBQUMsV0FBUixJQUF1QjtRQUVyQyxNQUFBLEdBQVM7QUFFVCxhQUFTLDBGQUFUO1VBQ0UsTUFBQSxJQUFVO0FBRFo7UUFHQSxrQkFBQSxHQUNFO1VBQUEsTUFBQSxFQUFTLE9BQU8sQ0FBQyxNQUFqQjtVQUNBLFFBQUEsRUFBYSxpQkFBQSxJQUFhLDBCQUFoQixHQUF1QyxPQUFPLENBQUMsUUFBL0MsR0FBNkQsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsbUJBQWhCLENBRHZFO1VBRUEsTUFBQSxFQUFRLE1BRlI7O0FBSUY7aUJBQ0UsT0FBQSxDQUFRLGdCQUFBLENBQWlCLElBQWpCLEVBQXVCLGtCQUF2QixDQUFSLEVBREY7U0FBQSxjQUFBO1VBRU07aUJBRUosTUFBQSxDQUFPLEtBQVAsRUFKRjs7TUFoQmtCLENBQWI7SUFGQzs7OztLQVJtQztBQUgvQyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBNYXJrb0JlYXV0aWZpZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG5cbiAgbmFtZTogJ01hcmtvIEJlYXV0aWZpZXInXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL21hcmtvLWpzL21hcmtvLXByZXR0eXByaW50XCJcblxuICBvcHRpb25zOlxuICAgIE1hcmtvOiB0cnVlXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucywgY29udGV4dCkgLT5cblxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIG1hcmtvUHJldHR5cHJpbnQgPSByZXF1aXJlKCdtYXJrby1wcmV0dHlwcmludCcpXG5cbiAgICAgIGluZGVudF9jaGFyID0gb3B0aW9ucy5pbmRlbnRfY2hhciB8fCAnICdcbiAgICAgIGluZGVudF9zaXplID0gb3B0aW9ucy5pbmRlbnRfc2l6ZSB8fCA0XG5cbiAgICAgIGluZGVudCA9ICcnXG5cbiAgICAgIGZvciBpIGluIFswLi5pbmRlbnRfc2l6ZSAtIDFdXG4gICAgICAgIGluZGVudCArPSBpbmRlbnRfY2hhclxuXG4gICAgICBwcmV0dHlwcmludE9wdGlvbnMgPVxuICAgICAgICBzeW50YXggOiBvcHRpb25zLnN5bnRheFxuICAgICAgICBmaWxlbmFtZTogaWYgY29udGV4dD8gYW5kIGNvbnRleHQuZmlsZVBhdGg/IHRoZW4gY29udGV4dC5maWxlUGF0aCBlbHNlIHJlcXVpcmUucmVzb2x2ZSgnbWFya28tcHJldHR5cHJpbnQnKVxuICAgICAgICBpbmRlbnQ6IGluZGVudFxuXG4gICAgICB0cnlcbiAgICAgICAgcmVzb2x2ZShtYXJrb1ByZXR0eXByaW50KHRleHQsIHByZXR0eXByaW50T3B0aW9ucykpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICAjIEVycm9yIG9jY3VycmVkXG4gICAgICAgIHJlamVjdChlcnJvcilcbiAgICApXG4iXX0=
