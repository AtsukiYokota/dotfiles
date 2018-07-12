(function() {
  "use strict";
  var Beautifier, SassConvert,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = SassConvert = (function(superClass) {
    extend(SassConvert, superClass);

    function SassConvert() {
      return SassConvert.__super__.constructor.apply(this, arguments);
    }

    SassConvert.prototype.name = "SassConvert";

    SassConvert.prototype.link = "http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax";

    SassConvert.prototype.executables = [
      {
        name: "SassConvert",
        cmd: "sass-convert",
        homepage: "http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax",
        installation: "http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax",
        version: {
          parse: function(text) {
            return text.match(/Sass (\d+\.\d+\.\d+)/)[1];
          }
        },
        docker: {
          image: "unibeautify/sass-convert"
        }
      }
    ];

    SassConvert.prototype.options = {
      CSS: false,
      Sass: false,
      SCSS: false
    };

    SassConvert.prototype.beautify = function(text, language, options, context) {
      var lang;
      lang = language.toLowerCase();
      return this.exe("sass-convert").run([this.tempFile("input", text), "--from", lang, "--to", lang]);
    };

    return SassConvert;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3Nhc3MtY29udmVydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTs7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzBCQUNyQixJQUFBLEdBQU07OzBCQUNOLElBQUEsR0FBTTs7MEJBQ04sV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sYUFEUjtRQUVFLEdBQUEsRUFBSyxjQUZQO1FBR0UsUUFBQSxFQUFVLG9FQUhaO1FBSUUsWUFBQSxFQUFjLG9FQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxzQkFBWCxDQUFtQyxDQUFBLENBQUE7VUFBN0MsQ0FEQTtTQUxYO1FBUUUsTUFBQSxFQUFRO1VBQ04sS0FBQSxFQUFPLDBCQUREO1NBUlY7T0FEVzs7OzBCQWViLE9BQUEsR0FFRTtNQUFBLEdBQUEsRUFBSyxLQUFMO01BQ0EsSUFBQSxFQUFNLEtBRE47TUFFQSxJQUFBLEVBQU0sS0FGTjs7OzBCQUlGLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEVBQTBCLE9BQTFCO0FBQ1IsVUFBQTtNQUFBLElBQUEsR0FBTyxRQUFRLENBQUMsV0FBVCxDQUFBO2FBQ1AsSUFBQyxDQUFBLEdBQUQsQ0FBSyxjQUFMLENBQW9CLENBQUMsR0FBckIsQ0FBeUIsQ0FDdkIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRHVCLEVBRXZCLFFBRnVCLEVBRWIsSUFGYSxFQUVQLE1BRk8sRUFFQyxJQUZELENBQXpCO0lBRlE7Ozs7S0F4QitCO0FBSDNDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNhc3NDb252ZXJ0IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlNhc3NDb252ZXJ0XCJcbiAgbGluazogXCJodHRwOi8vc2Fzcy1sYW5nLmNvbS9kb2N1bWVudGF0aW9uL2ZpbGUuU0FTU19SRUZFUkVOQ0UuaHRtbCNzeW50YXhcIlxuICBleGVjdXRhYmxlczogW1xuICAgIHtcbiAgICAgIG5hbWU6IFwiU2Fzc0NvbnZlcnRcIlxuICAgICAgY21kOiBcInNhc3MtY29udmVydFwiXG4gICAgICBob21lcGFnZTogXCJodHRwOi8vc2Fzcy1sYW5nLmNvbS9kb2N1bWVudGF0aW9uL2ZpbGUuU0FTU19SRUZFUkVOQ0UuaHRtbCNzeW50YXhcIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHA6Ly9zYXNzLWxhbmcuY29tL2RvY3VtZW50YXRpb24vZmlsZS5TQVNTX1JFRkVSRU5DRS5odG1sI3N5bnRheFwiXG4gICAgICB2ZXJzaW9uOiB7XG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5tYXRjaCgvU2FzcyAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXG4gICAgICB9XG4gICAgICBkb2NrZXI6IHtcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvc2Fzcy1jb252ZXJ0XCJcbiAgICAgIH1cbiAgICB9XG4gIF1cblxuICBvcHRpb25zOlxuICAgICMgVE9ETzogQWRkIHN1cHBvcnQgZm9yIG9wdGlvbnNcbiAgICBDU1M6IGZhbHNlXG4gICAgU2FzczogZmFsc2VcbiAgICBTQ1NTOiBmYWxzZVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMsIGNvbnRleHQpIC0+XG4gICAgbGFuZyA9IGxhbmd1YWdlLnRvTG93ZXJDYXNlKClcbiAgICBAZXhlKFwic2Fzcy1jb252ZXJ0XCIpLnJ1bihbXG4gICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KSxcbiAgICAgIFwiLS1mcm9tXCIsIGxhbmcsIFwiLS10b1wiLCBsYW5nXG4gICAgXSlcbiJdfQ==
