(function() {
  "use strict";
  var Beautifier, TidyMarkdown,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = TidyMarkdown = (function(superClass) {
    extend(TidyMarkdown, superClass);

    function TidyMarkdown() {
      return TidyMarkdown.__super__.constructor.apply(this, arguments);
    }

    TidyMarkdown.prototype.name = "Tidy Markdown";

    TidyMarkdown.prototype.link = "https://github.com/slang800/tidy-markdown";

    TidyMarkdown.prototype.options = {
      Markdown: false
    };

    TidyMarkdown.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var cleanMarkdown, tidyMarkdown;
        tidyMarkdown = require('tidy-markdown');
        cleanMarkdown = tidyMarkdown(text);
        return resolve(cleanMarkdown);
      });
    };

    return TidyMarkdown;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3RpZHktbWFya2Rvd24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzsyQkFDckIsSUFBQSxHQUFNOzsyQkFDTixJQUFBLEdBQU07OzJCQUNOLE9BQUEsR0FBUztNQUNQLFFBQUEsRUFBVSxLQURIOzs7MkJBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixhQUFPLElBQUksSUFBQyxDQUFBLE9BQUwsQ0FBYSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2xCLFlBQUE7UUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGVBQVI7UUFDZixhQUFBLEdBQWdCLFlBQUEsQ0FBYSxJQUFiO2VBQ2hCLE9BQUEsQ0FBUSxhQUFSO01BSGtCLENBQWI7SUFEQzs7OztLQVBnQztBQUg1QyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUaWR5TWFya2Rvd24gZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiVGlkeSBNYXJrZG93blwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3NsYW5nODAwL3RpZHktbWFya2Rvd25cIlxuICBvcHRpb25zOiB7XG4gICAgTWFya2Rvd246IGZhbHNlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIHRpZHlNYXJrZG93biA9IHJlcXVpcmUgJ3RpZHktbWFya2Rvd24nXG4gICAgICBjbGVhbk1hcmtkb3duID0gdGlkeU1hcmtkb3duKHRleHQpXG4gICAgICByZXNvbHZlKGNsZWFuTWFya2Rvd24pXG4gICAgKVxuIl19
