
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Languages, _, extend;

  _ = require('lodash');

  extend = null;

  module.exports = Languages = (function() {
    Languages.prototype.languageNames = ["apex", "arduino", "bash", "blade", "c-sharp", "c", "clojure", "coffeescript", "coldfusion", "cpp", "crystal", "css", "csv", "d", "ejs", "elm", "erb", "erlang", "gherkin", "glsl", "gn", "go", "gohtml", "fortran", "handlebars", "haskell", "html", "jade", "java", "javascript", "json", "jsx", "latex", "less", "lua", "markdown", 'marko', "mustache", "nginx", "nunjucks", "objective-c", "ocaml", "pawn", "perl", "php", "puppet", "python", "r", "riotjs", "ruby", "rust", "sass", "scss", "spacebars", "sql", "svg", "swig", "tss", "tsx", "twig", "typescript", "ux_markup", "vala", "vue", "vhdl", "visualforce", "xml", "xtemplate", "yaml", "terraform", "verilog"];


    /*
    Languages
     */

    Languages.prototype.languages = null;


    /*
    Namespaces
     */

    Languages.prototype.namespaces = null;


    /*
    Constructor
     */

    function Languages() {
      this.languages = _.map(this.languageNames, function(name) {
        return require("./" + name);
      });
      this.namespaces = _.map(this.languages, function(language) {
        return language.namespace;
      });
    }


    /*
    Get language for grammar and extension
     */

    Languages.prototype.getLanguages = function(arg) {
      var extension, grammar, name, namespace;
      name = arg.name, namespace = arg.namespace, grammar = arg.grammar, extension = arg.extension;
      return _.union(_.filter(this.languages, function(language) {
        return _.isEqual(language.name, name);
      }), _.filter(this.languages, function(language) {
        return _.isEqual(language.namespace, namespace);
      }), _.filter(this.languages, function(language) {
        return _.includes(language.grammars, grammar);
      }), _.filter(this.languages, function(language) {
        return _.includes(language.extensions, extension);
      }));
    };

    return Languages;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFHQTtBQUhBLE1BQUE7O0VBS0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLE1BQUEsR0FBUzs7RUFHVCxNQUFNLENBQUMsT0FBUCxHQUF1Qjt3QkFJckIsYUFBQSxHQUFlLENBQ2IsTUFEYSxFQUViLFNBRmEsRUFHYixNQUhhLEVBSWIsT0FKYSxFQUtiLFNBTGEsRUFNYixHQU5hLEVBT2IsU0FQYSxFQVFiLGNBUmEsRUFTYixZQVRhLEVBVWIsS0FWYSxFQVdiLFNBWGEsRUFZYixLQVphLEVBYWIsS0FiYSxFQWNiLEdBZGEsRUFlYixLQWZhLEVBZ0JiLEtBaEJhLEVBaUJiLEtBakJhLEVBa0JiLFFBbEJhLEVBbUJiLFNBbkJhLEVBb0JiLE1BcEJhLEVBcUJiLElBckJhLEVBc0JiLElBdEJhLEVBdUJiLFFBdkJhLEVBd0JiLFNBeEJhLEVBeUJiLFlBekJhLEVBMEJiLFNBMUJhLEVBMkJiLE1BM0JhLEVBNEJiLE1BNUJhLEVBNkJiLE1BN0JhLEVBOEJiLFlBOUJhLEVBK0JiLE1BL0JhLEVBZ0NiLEtBaENhLEVBaUNiLE9BakNhLEVBa0NiLE1BbENhLEVBbUNiLEtBbkNhLEVBb0NiLFVBcENhLEVBcUNiLE9BckNhLEVBc0NiLFVBdENhLEVBdUNiLE9BdkNhLEVBd0NiLFVBeENhLEVBeUNiLGFBekNhLEVBMENiLE9BMUNhLEVBMkNiLE1BM0NhLEVBNENiLE1BNUNhLEVBNkNiLEtBN0NhLEVBOENiLFFBOUNhLEVBK0NiLFFBL0NhLEVBZ0RiLEdBaERhLEVBaURiLFFBakRhLEVBa0RiLE1BbERhLEVBbURiLE1BbkRhLEVBb0RiLE1BcERhLEVBcURiLE1BckRhLEVBc0RiLFdBdERhLEVBdURiLEtBdkRhLEVBd0RiLEtBeERhLEVBeURiLE1BekRhLEVBMERiLEtBMURhLEVBMkRiLEtBM0RhLEVBNERiLE1BNURhLEVBNkRiLFlBN0RhLEVBOERiLFdBOURhLEVBK0RiLE1BL0RhLEVBZ0ViLEtBaEVhLEVBaUViLE1BakVhLEVBa0ViLGFBbEVhLEVBbUViLEtBbkVhLEVBb0ViLFdBcEVhLEVBcUViLE1BckVhLEVBc0ViLFdBdEVhLEVBdUViLFNBdkVhOzs7QUEwRWY7Ozs7d0JBR0EsU0FBQSxHQUFXOzs7QUFFWDs7Ozt3QkFHQSxVQUFBLEdBQVk7OztBQUVaOzs7O0lBR2EsbUJBQUE7TUFDWCxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLGFBQVAsRUFBc0IsU0FBQyxJQUFEO2VBQ2pDLE9BQUEsQ0FBUSxJQUFBLEdBQUssSUFBYjtNQURpQyxDQUF0QjtNQUdiLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxJQUFDLENBQUEsU0FBUCxFQUFrQixTQUFDLFFBQUQ7ZUFBYyxRQUFRLENBQUM7TUFBdkIsQ0FBbEI7SUFKSDs7O0FBTWI7Ozs7d0JBR0EsWUFBQSxHQUFjLFNBQUMsR0FBRDtBQUVaLFVBQUE7TUFGYyxpQkFBTSwyQkFBVyx1QkFBUzthQUV4QyxDQUFDLENBQUMsS0FBRixDQUNFLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLFNBQVYsRUFBcUIsU0FBQyxRQUFEO2VBQWMsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxRQUFRLENBQUMsSUFBbkIsRUFBeUIsSUFBekI7TUFBZCxDQUFyQixDQURGLEVBRUUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQ7ZUFBYyxDQUFDLENBQUMsT0FBRixDQUFVLFFBQVEsQ0FBQyxTQUFuQixFQUE4QixTQUE5QjtNQUFkLENBQXJCLENBRkYsRUFHRSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLFNBQUMsUUFBRDtlQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBUSxDQUFDLFFBQXBCLEVBQThCLE9BQTlCO01BQWQsQ0FBckIsQ0FIRixFQUlFLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLFNBQVYsRUFBcUIsU0FBQyxRQUFEO2VBQWMsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxRQUFRLENBQUMsVUFBcEIsRUFBZ0MsU0FBaEM7TUFBZCxDQUFyQixDQUpGO0lBRlk7Ozs7O0FBN0doQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuTGFuZ3VhZ2UgU3VwcG9ydCBhbmQgZGVmYXVsdCBvcHRpb25zLlxuIyMjXG5cInVzZSBzdHJpY3RcIlxuIyBMYXp5IGxvYWRlZCBkZXBlbmRlbmNpZXNcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuZXh0ZW5kID0gbnVsbFxuXG4jXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIExhbmd1YWdlc1xuXG4gICMgU3VwcG9ydGVkIHVuaXF1ZSBjb25maWd1cmF0aW9uIGtleXNcbiAgIyBVc2VkIGZvciBkZXRlY3RpbmcgbmVzdGVkIGNvbmZpZ3VyYXRpb25zIGluIC5qc2JlYXV0aWZ5cmNcbiAgbGFuZ3VhZ2VOYW1lczogW1xuICAgIFwiYXBleFwiXG4gICAgXCJhcmR1aW5vXCJcbiAgICBcImJhc2hcIlxuICAgIFwiYmxhZGVcIlxuICAgIFwiYy1zaGFycFwiXG4gICAgXCJjXCJcbiAgICBcImNsb2p1cmVcIlxuICAgIFwiY29mZmVlc2NyaXB0XCJcbiAgICBcImNvbGRmdXNpb25cIlxuICAgIFwiY3BwXCJcbiAgICBcImNyeXN0YWxcIlxuICAgIFwiY3NzXCJcbiAgICBcImNzdlwiXG4gICAgXCJkXCJcbiAgICBcImVqc1wiXG4gICAgXCJlbG1cIlxuICAgIFwiZXJiXCJcbiAgICBcImVybGFuZ1wiXG4gICAgXCJnaGVya2luXCJcbiAgICBcImdsc2xcIlxuICAgIFwiZ25cIlxuICAgIFwiZ29cIlxuICAgIFwiZ29odG1sXCJcbiAgICBcImZvcnRyYW5cIlxuICAgIFwiaGFuZGxlYmFyc1wiXG4gICAgXCJoYXNrZWxsXCJcbiAgICBcImh0bWxcIlxuICAgIFwiamFkZVwiXG4gICAgXCJqYXZhXCJcbiAgICBcImphdmFzY3JpcHRcIlxuICAgIFwianNvblwiXG4gICAgXCJqc3hcIlxuICAgIFwibGF0ZXhcIlxuICAgIFwibGVzc1wiXG4gICAgXCJsdWFcIlxuICAgIFwibWFya2Rvd25cIlxuICAgICdtYXJrbydcbiAgICBcIm11c3RhY2hlXCJcbiAgICBcIm5naW54XCJcbiAgICBcIm51bmp1Y2tzXCJcbiAgICBcIm9iamVjdGl2ZS1jXCJcbiAgICBcIm9jYW1sXCJcbiAgICBcInBhd25cIlxuICAgIFwicGVybFwiXG4gICAgXCJwaHBcIlxuICAgIFwicHVwcGV0XCJcbiAgICBcInB5dGhvblwiXG4gICAgXCJyXCJcbiAgICBcInJpb3Rqc1wiXG4gICAgXCJydWJ5XCJcbiAgICBcInJ1c3RcIlxuICAgIFwic2Fzc1wiXG4gICAgXCJzY3NzXCJcbiAgICBcInNwYWNlYmFyc1wiXG4gICAgXCJzcWxcIlxuICAgIFwic3ZnXCJcbiAgICBcInN3aWdcIlxuICAgIFwidHNzXCJcbiAgICBcInRzeFwiXG4gICAgXCJ0d2lnXCJcbiAgICBcInR5cGVzY3JpcHRcIlxuICAgIFwidXhfbWFya3VwXCJcbiAgICBcInZhbGFcIlxuICAgIFwidnVlXCJcbiAgICBcInZoZGxcIlxuICAgIFwidmlzdWFsZm9yY2VcIlxuICAgIFwieG1sXCJcbiAgICBcInh0ZW1wbGF0ZVwiXG4gICAgXCJ5YW1sXCJcbiAgICBcInRlcnJhZm9ybVwiXG4gICAgXCJ2ZXJpbG9nXCJcbiAgXVxuXG4gICMjI1xuICBMYW5ndWFnZXNcbiAgIyMjXG4gIGxhbmd1YWdlczogbnVsbFxuXG4gICMjI1xuICBOYW1lc3BhY2VzXG4gICMjI1xuICBuYW1lc3BhY2VzOiBudWxsXG5cbiAgIyMjXG4gIENvbnN0cnVjdG9yXG4gICMjI1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAbGFuZ3VhZ2VzID0gXy5tYXAoQGxhbmd1YWdlTmFtZXMsIChuYW1lKSAtPlxuICAgICAgcmVxdWlyZShcIi4vI3tuYW1lfVwiKVxuICAgIClcbiAgICBAbmFtZXNwYWNlcyA9IF8ubWFwKEBsYW5ndWFnZXMsIChsYW5ndWFnZSkgLT4gbGFuZ3VhZ2UubmFtZXNwYWNlKVxuXG4gICMjI1xuICBHZXQgbGFuZ3VhZ2UgZm9yIGdyYW1tYXIgYW5kIGV4dGVuc2lvblxuICAjIyNcbiAgZ2V0TGFuZ3VhZ2VzOiAoe25hbWUsIG5hbWVzcGFjZSwgZ3JhbW1hciwgZXh0ZW5zaW9ufSkgLT5cbiAgICAjIGNvbnNvbGUubG9nKCdnZXRMYW5ndWFnZXMnLCBuYW1lLCBuYW1lc3BhY2UsIGdyYW1tYXIsIGV4dGVuc2lvbiwgQGxhbmd1YWdlcylcbiAgICBfLnVuaW9uKFxuICAgICAgXy5maWx0ZXIoQGxhbmd1YWdlcywgKGxhbmd1YWdlKSAtPiBfLmlzRXF1YWwobGFuZ3VhZ2UubmFtZSwgbmFtZSkpXG4gICAgICBfLmZpbHRlcihAbGFuZ3VhZ2VzLCAobGFuZ3VhZ2UpIC0+IF8uaXNFcXVhbChsYW5ndWFnZS5uYW1lc3BhY2UsIG5hbWVzcGFjZSkpXG4gICAgICBfLmZpbHRlcihAbGFuZ3VhZ2VzLCAobGFuZ3VhZ2UpIC0+IF8uaW5jbHVkZXMobGFuZ3VhZ2UuZ3JhbW1hcnMsIGdyYW1tYXIpKVxuICAgICAgXy5maWx0ZXIoQGxhbmd1YWdlcywgKGxhbmd1YWdlKSAtPiBfLmluY2x1ZGVzKGxhbmd1YWdlLmV4dGVuc2lvbnMsIGV4dGVuc2lvbikpXG4gICAgKVxuIl19
