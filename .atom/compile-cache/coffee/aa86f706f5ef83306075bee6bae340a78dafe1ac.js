(function() {
  "use strict";
  var Beautifier, NginxBeautify,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = NginxBeautify = (function(superClass) {
    extend(NginxBeautify, superClass);

    function NginxBeautify() {
      return NginxBeautify.__super__.constructor.apply(this, arguments);
    }

    NginxBeautify.prototype.name = "Nginx Beautify";

    NginxBeautify.prototype.link = "https://github.com/denysvitali/nginxbeautify";

    NginxBeautify.prototype.options = {
      Nginx: {
        spaces: [
          "indent_with_tabs", "indent_size", "indent_char", function(indent_with_tabs, indent_size, indent_char) {
            if (indent_with_tabs || indent_char === "\t") {
              return 0;
            } else {
              return indent_size;
            }
          }
        ],
        tabs: [
          "indent_with_tabs", "indent_size", "indent_char", function(indent_with_tabs, indent_size, indent_char) {
            if (indent_with_tabs || indent_char === "\t") {
              return indent_size;
            } else {
              return 0;
            }
          }
        ],
        dontJoinCurlyBracet: true
      }
    };

    NginxBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var Beautify, error, instance;
        Beautify = require("nginxbeautify");
        instance = new Beautify(options);
        try {
          return resolve(instance.parse(text));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return NginxBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL25naW54LWJlYXV0aWZ5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSx5QkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7NEJBQ3JCLElBQUEsR0FBTTs7NEJBQ04sSUFBQSxHQUFNOzs0QkFFTixPQUFBLEdBQVM7TUFDUCxLQUFBLEVBQU87UUFDTCxNQUFBLEVBQVE7VUFBQyxrQkFBRCxFQUFxQixhQUFyQixFQUFvQyxhQUFwQyxFQUFtRCxTQUFDLGdCQUFELEVBQW1CLFdBQW5CLEVBQWdDLFdBQWhDO1lBQ3pELElBQUcsZ0JBQUEsSUFBb0IsV0FBQSxLQUFlLElBQXRDO3FCQUNFLEVBREY7YUFBQSxNQUFBO3FCQUdFLFlBSEY7O1VBRHlELENBQW5EO1NBREg7UUFPTCxJQUFBLEVBQU07VUFBQyxrQkFBRCxFQUFxQixhQUFyQixFQUFvQyxhQUFwQyxFQUFtRCxTQUFDLGdCQUFELEVBQW1CLFdBQW5CLEVBQWdDLFdBQWhDO1lBQ3ZELElBQUcsZ0JBQUEsSUFBb0IsV0FBQSxLQUFlLElBQXRDO3FCQUNFLFlBREY7YUFBQSxNQUFBO3FCQUdFLEVBSEY7O1VBRHVELENBQW5EO1NBUEQ7UUFhTCxtQkFBQSxFQUFxQixJQWJoQjtPQURBOzs7NEJBa0JULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBRVIsYUFBTyxJQUFJLElBQUMsQ0FBQSxPQUFMLENBQWEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixZQUFBO1FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxlQUFSO1FBQ1gsUUFBQSxHQUFXLElBQUksUUFBSixDQUFhLE9BQWI7QUFDWDtpQkFDRSxPQUFBLENBQVEsUUFBUSxDQUFDLEtBQVQsQ0FBZSxJQUFmLENBQVIsRUFERjtTQUFBLGNBQUE7VUFFTTtpQkFFSixNQUFBLENBQU8sS0FBUCxFQUpGOztNQUhrQixDQUFiO0lBRkM7Ozs7S0F0QmlDO0FBSDdDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE5naW54QmVhdXRpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiTmdpbnggQmVhdXRpZnlcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9kZW55c3ZpdGFsaS9uZ2lueGJlYXV0aWZ5XCJcblxuICBvcHRpb25zOiB7XG4gICAgTmdpbng6IHtcbiAgICAgIHNwYWNlczogW1wiaW5kZW50X3dpdGhfdGFic1wiLCBcImluZGVudF9zaXplXCIsIFwiaW5kZW50X2NoYXJcIiwgKGluZGVudF93aXRoX3RhYnMsIGluZGVudF9zaXplLCBpbmRlbnRfY2hhcikgLT5cbiAgICAgICAgaWYgaW5kZW50X3dpdGhfdGFicyBvciBpbmRlbnRfY2hhciBpcyBcIlxcdFwiXG4gICAgICAgICAgMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgaW5kZW50X3NpemVcbiAgICAgIF1cbiAgICAgIHRhYnM6IFtcImluZGVudF93aXRoX3RhYnNcIiwgXCJpbmRlbnRfc2l6ZVwiLCBcImluZGVudF9jaGFyXCIsIChpbmRlbnRfd2l0aF90YWJzLCBpbmRlbnRfc2l6ZSwgaW5kZW50X2NoYXIpIC0+XG4gICAgICAgIGlmIGluZGVudF93aXRoX3RhYnMgb3IgaW5kZW50X2NoYXIgaXMgXCJcXHRcIlxuICAgICAgICAgIGluZGVudF9zaXplXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAwXG4gICAgICBdXG4gICAgICBkb250Sm9pbkN1cmx5QnJhY2V0OiB0cnVlXG4gICAgfVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cblxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIEJlYXV0aWZ5ID0gcmVxdWlyZShcIm5naW54YmVhdXRpZnlcIilcbiAgICAgIGluc3RhbmNlID0gbmV3IEJlYXV0aWZ5KG9wdGlvbnMpXG4gICAgICB0cnlcbiAgICAgICAgcmVzb2x2ZShpbnN0YW5jZS5wYXJzZSh0ZXh0KSlcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICMgRXJyb3Igb2NjdXJyZWRcbiAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgIClcbiJdfQ==
