(function() {
  "use strict";
  var Beautifier, Prettier, path, prettier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  prettier = require("prettier");

  path = require("path");

  module.exports = Prettier = (function(superClass) {
    extend(Prettier, superClass);

    function Prettier() {
      return Prettier.__super__.constructor.apply(this, arguments);
    }

    Prettier.prototype.name = "Prettier";

    Prettier.prototype.link = "https://github.com/prettier/prettier";

    Prettier.prototype.options = {
      _: {
        tabWidth: "indent_size",
        useTabs: [
          "indent_with_tabs", "indent_char", function(indent_with_tabs, indent_char) {
            return (indent_with_tabs === true) || (indent_char === "\t");
          }
        ]
      },
      JavaScript: {
        bracketSpacing: "object_curly_spacing"
      },
      TypeScript: false,
      CSS: false,
      LESS: false,
      SCSS: false,
      Vue: false,
      JSON: false,
      Markdown: false
    };

    Prettier.prototype.beautify = function(text, language, options, context) {
      return new this.Promise(function(resolve, reject) {
        var _, err, filePath, parser, prettierLanguage;
        _ = require('lodash');
        prettierLanguage = _.find(prettier.getSupportInfo().languages, {
          'name': language
        });
        if (prettierLanguage) {
          parser = prettierLanguage.parsers[0];
          options.parser = parser;
        } else {
          reject(new Error("Unknown language for Prettier"));
        }
        filePath = context.filePath && path.dirname(context.filePath);
        try {
          return prettier.resolveConfig(filePath).then(function(configOptions) {
            var result;
            result = prettier.format(text, configOptions || options);
            prettier.clearConfigCache();
            return resolve(result);
          });
        } catch (error) {
          err = error;
          return reject(err);
        }
      });
    };

    return Prettier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3ByZXR0aWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSxvQ0FBQTtJQUFBOzs7RUFFQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztFQUNYLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt1QkFDckIsSUFBQSxHQUFNOzt1QkFDTixJQUFBLEdBQU07O3VCQUNOLE9BQUEsR0FBUztNQUNQLENBQUEsRUFDRTtRQUFBLFFBQUEsRUFBVSxhQUFWO1FBQ0EsT0FBQSxFQUFTO1VBQUMsa0JBQUQsRUFBcUIsYUFBckIsRUFBb0MsU0FBQyxnQkFBRCxFQUFtQixXQUFuQjtBQUMzQyxtQkFBTyxDQUFDLGdCQUFBLEtBQW9CLElBQXJCLENBQUEsSUFBOEIsQ0FBQyxXQUFBLEtBQWUsSUFBaEI7VUFETSxDQUFwQztTQURUO09BRks7TUFNUCxVQUFBLEVBQ0U7UUFBQSxjQUFBLEVBQWdCLHNCQUFoQjtPQVBLO01BUVAsVUFBQSxFQUFZLEtBUkw7TUFTUCxHQUFBLEVBQUssS0FURTtNQVVQLElBQUEsRUFBTSxLQVZDO01BV1AsSUFBQSxFQUFNLEtBWEM7TUFZUCxHQUFBLEVBQUssS0FaRTtNQWFQLElBQUEsRUFBTSxLQWJDO01BY1AsUUFBQSxFQUFVLEtBZEg7Ozt1QkFpQlQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixhQUFPLElBQUksSUFBQyxDQUFBLE9BQUwsQ0FBYSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2xCLFlBQUE7UUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7UUFFSixnQkFBQSxHQUFtQixDQUFDLENBQUMsSUFBRixDQUFPLFFBQVEsQ0FBQyxjQUFULENBQUEsQ0FBeUIsQ0FBQyxTQUFqQyxFQUE0QztVQUFBLE1BQUEsRUFBUSxRQUFSO1NBQTVDO1FBQ25CLElBQUcsZ0JBQUg7VUFDRSxNQUFBLEdBQVMsZ0JBQWdCLENBQUMsT0FBUSxDQUFBLENBQUE7VUFDbEMsT0FBTyxDQUFDLE1BQVIsR0FBaUIsT0FGbkI7U0FBQSxNQUFBO1VBSUUsTUFBQSxDQUFPLElBQUksS0FBSixDQUFVLCtCQUFWLENBQVAsRUFKRjs7UUFNQSxRQUFBLEdBQVcsT0FBTyxDQUFDLFFBQVIsSUFBcUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxPQUFPLENBQUMsUUFBckI7QUFFaEM7aUJBQ0UsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxTQUFDLGFBQUQ7QUFDcEMsZ0JBQUE7WUFBQSxNQUFBLEdBQVMsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBc0IsYUFBQSxJQUFpQixPQUF2QztZQUNULFFBQVEsQ0FBQyxnQkFBVCxDQUFBO21CQUNBLE9BQUEsQ0FBUSxNQUFSO1VBSG9DLENBQXRDLEVBREY7U0FBQSxhQUFBO1VBTU07aUJBQ0osTUFBQSxDQUFPLEdBQVAsRUFQRjs7TUFaa0IsQ0FBYjtJQURDOzs7O0tBcEI0QjtBQU54QyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5cbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxucHJldHRpZXIgPSByZXF1aXJlKFwicHJldHRpZXJcIilcbnBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFByZXR0aWVyIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlByZXR0aWVyXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vcHJldHRpZXIvcHJldHRpZXJcIlxuICBvcHRpb25zOiB7XG4gICAgXzpcbiAgICAgIHRhYldpZHRoOiBcImluZGVudF9zaXplXCJcbiAgICAgIHVzZVRhYnM6IFtcImluZGVudF93aXRoX3RhYnNcIiwgXCJpbmRlbnRfY2hhclwiLCAoaW5kZW50X3dpdGhfdGFicywgaW5kZW50X2NoYXIpIC0+XG4gICAgICAgIHJldHVybiAoaW5kZW50X3dpdGhfdGFicyBpcyB0cnVlKSBvciAoaW5kZW50X2NoYXIgaXMgXCJcXHRcIilcbiAgICAgIF1cbiAgICBKYXZhU2NyaXB0OlxuICAgICAgYnJhY2tldFNwYWNpbmc6IFwib2JqZWN0X2N1cmx5X3NwYWNpbmdcIlxuICAgIFR5cGVTY3JpcHQ6IGZhbHNlXG4gICAgQ1NTOiBmYWxzZVxuICAgIExFU1M6IGZhbHNlXG4gICAgU0NTUzogZmFsc2VcbiAgICBWdWU6IGZhbHNlXG4gICAgSlNPTjogZmFsc2VcbiAgICBNYXJrZG93bjogZmFsc2VcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMsIGNvbnRleHQpIC0+XG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5cbiAgICAgIHByZXR0aWVyTGFuZ3VhZ2UgPSBfLmZpbmQocHJldHRpZXIuZ2V0U3VwcG9ydEluZm8oKS5sYW5ndWFnZXMsICduYW1lJzogbGFuZ3VhZ2UpXG4gICAgICBpZiBwcmV0dGllckxhbmd1YWdlXG4gICAgICAgIHBhcnNlciA9IHByZXR0aWVyTGFuZ3VhZ2UucGFyc2Vyc1swXVxuICAgICAgICBvcHRpb25zLnBhcnNlciA9IHBhcnNlclxuICAgICAgZWxzZVxuICAgICAgICByZWplY3QobmV3IEVycm9yKFwiVW5rbm93biBsYW5ndWFnZSBmb3IgUHJldHRpZXJcIikpXG5cbiAgICAgIGZpbGVQYXRoID0gY29udGV4dC5maWxlUGF0aCBhbmQgcGF0aC5kaXJuYW1lIGNvbnRleHQuZmlsZVBhdGhcblxuICAgICAgdHJ5XG4gICAgICAgIHByZXR0aWVyLnJlc29sdmVDb25maWcoZmlsZVBhdGgpLnRoZW4oKGNvbmZpZ09wdGlvbnMpIC0+XG4gICAgICAgICAgcmVzdWx0ID0gcHJldHRpZXIuZm9ybWF0KHRleHQsIGNvbmZpZ09wdGlvbnMgb3Igb3B0aW9ucylcbiAgICAgICAgICBwcmV0dGllci5jbGVhckNvbmZpZ0NhY2hlKClcbiAgICAgICAgICByZXNvbHZlIHJlc3VsdFxuICAgICAgICApXG4gICAgICBjYXRjaCBlcnJcbiAgICAgICAgcmVqZWN0KGVycilcbiAgICApIl19
