(function() {
  "use strict";
  var Beautifier, PrettyDiff,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PrettyDiff = (function(superClass) {
    extend(PrettyDiff, superClass);

    function PrettyDiff() {
      return PrettyDiff.__super__.constructor.apply(this, arguments);
    }

    PrettyDiff.prototype.name = "Pretty Diff";

    PrettyDiff.prototype.link = "https://github.com/prettydiff/prettydiff";

    PrettyDiff.prototype.options = {
      _: {
        inchar: [
          "indent_with_tabs", "indent_char", function(indent_with_tabs, indent_char) {
            if (indent_with_tabs === true) {
              return "\t";
            } else {
              return indent_char;
            }
          }
        ],
        insize: [
          "indent_with_tabs", "indent_size", function(indent_with_tabs, indent_size) {
            if (indent_with_tabs === true) {
              return 1;
            } else {
              return indent_size;
            }
          }
        ],
        objsort: function(objsort) {
          return objsort || false;
        },
        preserve: [
          'preserve_newlines', function(preserve_newlines) {
            if (preserve_newlines === true) {
              return "all";
            } else {
              return "none";
            }
          }
        ],
        cssinsertlines: "newline_between_rules",
        comments: [
          "indent_comments", function(indent_comments) {
            if (indent_comments === false) {
              return "noindent";
            } else {
              return "indent";
            }
          }
        ],
        force: "force_indentation",
        quoteConvert: "convert_quotes",
        vertical: [
          'align_assignments', function(align_assignments) {
            if (align_assignments === true) {
              return "all";
            } else {
              return "none";
            }
          }
        ],
        wrap: "wrap_line_length",
        space: "space_after_anon_function",
        noleadzero: "no_lead_zero",
        endcomma: "end_with_comma",
        methodchain: [
          'break_chained_methods', function(break_chained_methods) {
            if (break_chained_methods === true) {
              return false;
            } else {
              return true;
            }
          }
        ],
        ternaryline: "preserve_ternary_lines",
        bracepadding: "space_in_paren"
      },
      CSV: true,
      Coldfusion: true,
      ERB: true,
      EJS: true,
      HTML: true,
      Handlebars: true,
      Mustache: true,
      Nunjucks: true,
      XML: true,
      SVG: true,
      Spacebars: true,
      JSX: true,
      JavaScript: true,
      CSS: true,
      SCSS: true,
      JSON: true,
      TSS: true,
      Twig: true,
      LESS: true,
      Swig: true,
      "UX Markup": true,
      Visualforce: true,
      "Riot.js": true,
      XTemplate: true,
      "Golang Template": true
    };

    PrettyDiff.prototype.beautify = function(text, language, options) {
      options.crlf = this.getDefaultLineEnding(true, false, options.end_of_line);
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var _, args, lang, prettydiff, result;
          prettydiff = require("prettydiff2");
          _ = require('lodash');
          lang = "auto";
          switch (language) {
            case "CSV":
              lang = "csv";
              break;
            case "EJS":
            case "Twig":
              lang = "ejs";
              break;
            case "ERB":
              lang = "html_ruby";
              break;
            case "Handlebars":
            case "Mustache":
            case "Spacebars":
            case "Swig":
            case "Riot.js":
            case "XTemplate":
              lang = "handlebars";
              break;
            case "SGML":
              lang = "markup";
              break;
            case "XML":
            case "Visualforce":
            case "SVG":
            case "UX Markup":
              lang = "xml";
              break;
            case "HTML":
            case "Nunjucks":
            case "Coldfusion":
              lang = "html";
              break;
            case "JavaScript":
              lang = "javascript";
              break;
            case "JSON":
              lang = "json";
              break;
            case "JSX":
              lang = "jsx";
              break;
            case "JSTL":
              lang = "jsp";
              break;
            case "CSS":
              lang = "css";
              break;
            case "LESS":
              lang = "less";
              break;
            case "SCSS":
              lang = "scss";
              break;
            case "TSS":
              lang = "tss";
              break;
            case "Golang Template":
              lang = "go";
              break;
            default:
              lang = "auto";
          }
          args = {
            source: text,
            lang: lang,
            mode: "beautify"
          };
          _.merge(options, args);
          _this.verbose('prettydiff', options);
          result = prettydiff(options);
          return resolve(result);
        };
      })(this));
    };

    return PrettyDiff;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3ByZXR0eWRpZmYuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHNCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt5QkFDckIsSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O3lCQUNOLE9BQUEsR0FBUztNQUVQLENBQUEsRUFDRTtRQUFBLE1BQUEsRUFBUTtVQUFDLGtCQUFELEVBQXFCLGFBQXJCLEVBQW9DLFNBQUMsZ0JBQUQsRUFBbUIsV0FBbkI7WUFDMUMsSUFBSSxnQkFBQSxLQUFvQixJQUF4QjtxQkFDRSxLQURGO2FBQUEsTUFBQTtxQkFDWSxZQURaOztVQUQwQyxDQUFwQztTQUFSO1FBSUEsTUFBQSxFQUFRO1VBQUMsa0JBQUQsRUFBcUIsYUFBckIsRUFBb0MsU0FBQyxnQkFBRCxFQUFtQixXQUFuQjtZQUMxQyxJQUFJLGdCQUFBLEtBQW9CLElBQXhCO3FCQUNFLEVBREY7YUFBQSxNQUFBO3FCQUNTLFlBRFQ7O1VBRDBDLENBQXBDO1NBSlI7UUFRQSxPQUFBLEVBQVMsU0FBQyxPQUFEO2lCQUNQLE9BQUEsSUFBVztRQURKLENBUlQ7UUFVQSxRQUFBLEVBQVU7VUFBQyxtQkFBRCxFQUFzQixTQUFDLGlCQUFEO1lBQzlCLElBQUksaUJBQUEsS0FBcUIsSUFBekI7cUJBQ0UsTUFERjthQUFBLE1BQUE7cUJBQ2EsT0FEYjs7VUFEOEIsQ0FBdEI7U0FWVjtRQWNBLGNBQUEsRUFBZ0IsdUJBZGhCO1FBZUEsUUFBQSxFQUFVO1VBQUMsaUJBQUQsRUFBb0IsU0FBQyxlQUFEO1lBQzVCLElBQUksZUFBQSxLQUFtQixLQUF2QjtxQkFDRSxXQURGO2FBQUEsTUFBQTtxQkFDa0Is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QUFBLEdBQU87QUFESjtBQWZQLGlCQWlCTyxNQWpCUDtjQWtCSSxJQUFBLEdBQU87QUFESjtBQWpCUCxpQkFtQk8sS0FuQlA7Y0FvQkksSUFBQSxHQUFPO0FBREo7QUFuQlAsaUJBcUJPLE1BckJQO2NBc0JJLElBQUEsR0FBTztBQURKO0FBckJQLGlCQXVCTyxLQXZCUDtjQXdCSSxJQUFBLEdBQU87QUFESjtBQXZCUCxpQkF5Qk8sTUF6QlA7Y0EwQkksSUFBQSxHQUFPO0FBREo7QUF6QlAsaUJBMkJPLE1BM0JQO2NBNEJJLElBQUEsR0FBTztBQURKO0FBM0JQLGlCQTZCTyxLQTdCUDtjQThCSSxJQUFBLEdBQU87QUFESjtBQTdCUCxpQkErQk8saUJBL0JQO2NBZ0NJLElBQUEsR0FBTztBQURKO0FBL0JQO2NBa0NJLElBQUEsR0FBTztBQWxDWDtVQXFDQSxJQUFBLEdBQ0U7WUFBQSxNQUFBLEVBQVEsSUFBUjtZQUNBLElBQUEsRUFBTSxJQUROO1lBRUEsSUFBQSxFQUFNLFVBRk47O1VBS0YsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxPQUFSLEVBQWlCLElBQWpCO1VBR0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQXVCLE9BQXZCO1VBQ0EsTUFBQSxHQUFTLFVBQUEsQ0FBVyxPQUFYO2lCQUdULE9BQUEsQ0FBUSxNQUFSO1FBeERrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYjtJQUZDOzs7O0tBckU4QjtBQUgxQyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQcmV0dHlEaWZmIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlByZXR0eSBEaWZmXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vcHJldHR5ZGlmZi9wcmV0dHlkaWZmXCJcbiAgb3B0aW9uczoge1xuICAgICMgQXBwbHkgdGhlc2Ugb3B0aW9ucyBmaXJzdCAvIGdsb2JhbGx5LCBmb3IgYWxsIGxhbmd1YWdlc1xuICAgIF86XG4gICAgICBpbmNoYXI6IFtcImluZGVudF93aXRoX3RhYnNcIiwgXCJpbmRlbnRfY2hhclwiLCAoaW5kZW50X3dpdGhfdGFicywgaW5kZW50X2NoYXIpIC0+XG4gICAgICAgIGlmIChpbmRlbnRfd2l0aF90YWJzIGlzIHRydWUpIHRoZW4gXFxcbiAgICAgICAgICBcIlxcdFwiIGVsc2UgaW5kZW50X2NoYXJcbiAgICAgIF1cbiAgICAgIGluc2l6ZTogW1wiaW5kZW50X3dpdGhfdGFic1wiLCBcImluZGVudF9zaXplXCIsIChpbmRlbnRfd2l0aF90YWJzLCBpbmRlbnRfc2l6ZSkgLT5cbiAgICAgICAgaWYgKGluZGVudF93aXRoX3RhYnMgaXMgdHJ1ZSkgdGhlbiBcXFxuICAgICAgICAgIDEgZWxzZSBpbmRlbnRfc2l6ZVxuICAgICAgXVxuICAgICAgb2Jqc29ydDogKG9ianNvcnQpIC0+XG4gICAgICAgIG9ianNvcnQgb3IgZmFsc2VcbiAgICAgIHByZXNlcnZlOiBbJ3ByZXNlcnZlX25ld2xpbmVzJywgKHByZXNlcnZlX25ld2xpbmVzKSAtPlxuICAgICAgICBpZiAocHJlc2VydmVfbmV3bGluZXMgaXMgdHJ1ZSApIHRoZW4gXFxcbiAgICAgICAgICBcImFsbFwiIGVsc2UgXCJub25lXCJcbiAgICAgIF1cbiAgICAgIGNzc2luc2VydGxpbmVzOiBcIm5ld2xpbmVfYmV0d2Vlbl9ydWxlc1wiXG4gICAgICBjb21tZW50czogW1wiaW5kZW50X2NvbW1lbnRzXCIsIChpbmRlbnRfY29tbWVudHMpIC0+XG4gICAgICAgIGlmIChpbmRlbnRfY29tbWVudHMgaXMgZmFsc2UpIHRoZW4gXFxcbiAgICAgICAgICBcIm5vaW5kZW50XCIgZWxzZSBcImluZGVudFwiXG4gICAgICBdXG4gICAgICBmb3JjZTogXCJmb3JjZV9pbmRlbnRhdGlvblwiXG4gICAgICBxdW90ZUNvbnZlcnQ6IFwiY29udmVydF9xdW90ZXNcIlxuICAgICAgdmVydGljYWw6IFsnYWxpZ25fYXNzaWdubWVudHMnLCAoYWxpZ25fYXNzaWdubWVudHMpIC0+XG4gICAgICAgIGlmIChhbGlnbl9hc3NpZ25tZW50cyBpcyB0cnVlICkgdGhlbiBcXFxuICAgICAgICAgIFwiYWxsXCIgZWxzZSBcIm5vbmVcIlxuICAgICAgXVxuICAgICAgd3JhcDogXCJ3cmFwX2xpbmVfbGVuZ3RoXCJcbiAgICAgIHNwYWNlOiBcInNwYWNlX2FmdGVyX2Fub25fZnVuY3Rpb25cIlxuICAgICAgbm9sZWFkemVybzogXCJub19sZWFkX3plcm9cIlxuICAgICAgZW5kY29tbWE6IFwiZW5kX3dpdGhfY29tbWFcIlxuICAgICAgbWV0aG9kY2hhaW46IFsnYnJlYWtfY2hhaW5lZF9tZXRob2RzJywgKGJyZWFrX2NoYWluZWRfbWV0aG9kcykgLT5cbiAgICAgICAgaWYgKGJyZWFrX2NoYWluZWRfbWV0aG9kcyBpcyB0cnVlICkgdGhlbiBcXFxuICAgICAgICAgIGZhbHNlIGVsc2UgdHJ1ZVxuICAgICAgXVxuICAgICAgdGVybmFyeWxpbmU6IFwicHJlc2VydmVfdGVybmFyeV9saW5lc1wiXG4gICAgICBicmFjZXBhZGRpbmc6IFwic3BhY2VfaW5fcGFyZW5cIlxuICAgICMgQXBwbHkgbGFuZ3VhZ2Utc3BlY2lmaWMgb3B0aW9uc1xuICAgIENTVjogdHJ1ZVxuICAgIENvbGRmdXNpb246IHRydWVcbiAgICBFUkI6IHRydWVcbiAgICBFSlM6IHRydWVcbiAgICBIVE1MOiB0cnVlXG4gICAgSGFuZGxlYmFyczogdHJ1ZVxuICAgIE11c3RhY2hlOiB0cnVlXG4gICAgTnVuanVja3M6IHRydWVcbiAgICBYTUw6IHRydWVcbiAgICBTVkc6IHRydWVcbiAgICBTcGFjZWJhcnM6IHRydWVcbiAgICBKU1g6IHRydWVcbiAgICBKYXZhU2NyaXB0OiB0cnVlXG4gICAgQ1NTOiB0cnVlXG4gICAgU0NTUzogdHJ1ZVxuICAgIEpTT046IHRydWVcbiAgICBUU1M6IHRydWVcbiAgICBUd2lnOiB0cnVlXG4gICAgTEVTUzogdHJ1ZVxuICAgIFN3aWc6IHRydWVcbiAgICBcIlVYIE1hcmt1cFwiOiB0cnVlXG4gICAgVmlzdWFsZm9yY2U6IHRydWVcbiAgICBcIlJpb3QuanNcIjogdHJ1ZVxuICAgIFhUZW1wbGF0ZTogdHJ1ZVxuICAgIFwiR29sYW5nIFRlbXBsYXRlXCI6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucy5jcmxmID0gQGdldERlZmF1bHRMaW5lRW5kaW5nKHRydWUsZmFsc2Usb3B0aW9ucy5lbmRfb2ZfbGluZSlcbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBwcmV0dHlkaWZmID0gcmVxdWlyZShcInByZXR0eWRpZmYyXCIpXG4gICAgICBfID0gcmVxdWlyZSgnbG9kYXNoJylcblxuICAgICAgIyBTZWxlY3QgUHJldHR5ZGlmZiBsYW5ndWFnZVxuICAgICAgbGFuZyA9IFwiYXV0b1wiXG4gICAgICBzd2l0Y2ggbGFuZ3VhZ2VcbiAgICAgICAgd2hlbiBcIkNTVlwiXG4gICAgICAgICAgbGFuZyA9IFwiY3N2XCJcbiAgICAgICAgd2hlbiBcIkVKU1wiLCBcIlR3aWdcIlxuICAgICAgICAgIGxhbmcgPSBcImVqc1wiXG4gICAgICAgIHdoZW4gXCJFUkJcIlxuICAgICAgICAgIGxhbmcgPSBcImh0bWxfcnVieVwiXG4gICAgICAgIHdoZW4gXCJIYW5kbGViYXJzXCIsIFwiTXVzdGFjaGVcIiwgXCJTcGFjZWJhcnNcIiwgXCJTd2lnXCIsIFwiUmlvdC5qc1wiLCBcIlhUZW1wbGF0ZVwiXG4gICAgICAgICAgbGFuZyA9IFwiaGFuZGxlYmFyc1wiXG4gICAgICAgIHdoZW4gXCJTR01MXCJcbiAgICAgICAgICBsYW5nID0gXCJtYXJrdXBcIlxuICAgICAgICB3aGVuIFwiWE1MXCIsIFwiVmlzdWFsZm9yY2VcIiwgXCJTVkdcIiwgXCJVWCBNYXJrdXBcIlxuICAgICAgICAgIGxhbmcgPSBcInhtbFwiXG4gICAgICAgIHdoZW4gXCJIVE1MXCIsIFwiTnVuanVja3NcIiwgXCJDb2xkZnVzaW9uXCJcbiAgICAgICAgICBsYW5nID0gXCJodG1sXCJcbiAgICAgICAgd2hlbiBcIkphdmFTY3JpcHRcIlxuICAgICAgICAgIGxhbmcgPSBcImphdmFzY3JpcHRcIlxuICAgICAgICB3aGVuIFwiSlNPTlwiXG4gICAgICAgICAgbGFuZyA9IFwianNvblwiXG4gICAgICAgIHdoZW4gXCJKU1hcIlxuICAgICAgICAgIGxhbmcgPSBcImpzeFwiXG4gICAgICAgIHdoZW4gXCJKU1RMXCJcbiAgICAgICAgICBsYW5nID0gXCJqc3BcIlxuICAgICAgICB3aGVuIFwiQ1NTXCJcbiAgICAgICAgICBsYW5nID0gXCJjc3NcIlxuICAgICAgICB3aGVuIFwiTEVTU1wiXG4gICAgICAgICAgbGFuZyA9IFwibGVzc1wiXG4gICAgICAgIHdoZW4gXCJTQ1NTXCJcbiAgICAgICAgICBsYW5nID0gXCJzY3NzXCJcbiAgICAgICAgd2hlbiBcIlRTU1wiXG4gICAgICAgICAgbGFuZyA9IFwidHNzXCJcbiAgICAgICAgd2hlbiBcIkdvbGFuZyBUZW1wbGF0ZVwiXG4gICAgICAgICAgbGFuZyA9IFwiZ29cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgbGFuZyA9IFwiYXV0b1wiXG5cbiAgICAgICMgUHJldHR5ZGlmZiBBcmd1bWVudHNcbiAgICAgIGFyZ3MgPVxuICAgICAgICBzb3VyY2U6IHRleHRcbiAgICAgICAgbGFuZzogbGFuZ1xuICAgICAgICBtb2RlOiBcImJlYXV0aWZ5XCJcblxuICAgICAgIyBNZXJnZSBhcmdzIGludG9zIG9wdGlvbnNcbiAgICAgIF8ubWVyZ2Uob3B0aW9ucywgYXJncylcblxuICAgICAgIyBCZWF1dGlmeVxuICAgICAgQHZlcmJvc2UoJ3ByZXR0eWRpZmYnLCBvcHRpb25zKVxuICAgICAgcmVzdWx0ID0gcHJldHR5ZGlmZihvcHRpb25zKVxuXG4gICAgICAjIFJldHVybiBiZWF1dGlmaWVkIHRleHRcbiAgICAgIHJlc29sdmUocmVzdWx0KVxuXG4gICAgKVxuIl19
