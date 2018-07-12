
/*
Requires [perltidy](http://perltidy.sourceforge.net)
 */

(function() {
  "use strict";
  var Beautifier, PerlTidy,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PerlTidy = (function(superClass) {
    extend(PerlTidy, superClass);

    function PerlTidy() {
      return PerlTidy.__super__.constructor.apply(this, arguments);
    }

    PerlTidy.prototype.name = "Perltidy";

    PerlTidy.prototype.link = "http://perltidy.sourceforge.net/";

    PerlTidy.prototype.isPreInstalled = false;

    PerlTidy.prototype.options = {
      Perl: true
    };

    PerlTidy.prototype.cli = function(options) {
      if (options.perltidy_path == null) {
        return new Error("'Perl Perltidy Path' not set!" + " Please set this in the Atom Beautify package settings.");
      } else {
        return options.perltidy_path;
      }
    };

    PerlTidy.prototype.beautify = function(text, language, options) {
      var ref;
      return this.run("perltidy", ['--standard-output', '--standard-error-output', '--quiet', ((ref = options.perltidy_profile) != null ? ref.length : void 0) ? "--profile=" + options.perltidy_profile : void 0, this.tempFile("input", text)], {
        help: {
          link: "http://perltidy.sourceforge.net/"
        }
      });
    };

    return PerlTidy;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3Blcmx0aWR5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUdBO0FBSEEsTUFBQSxvQkFBQTtJQUFBOzs7RUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7dUJBQ3JCLElBQUEsR0FBTTs7dUJBQ04sSUFBQSxHQUFNOzt1QkFDTixjQUFBLEdBQWdCOzt1QkFFaEIsT0FBQSxHQUFTO01BQ1AsSUFBQSxFQUFNLElBREM7Ozt1QkFJVCxHQUFBLEdBQUssU0FBQyxPQUFEO01BQ0gsSUFBTyw2QkFBUDtBQUNFLGVBQU8sSUFBSSxLQUFKLENBQVUsK0JBQUEsR0FDZix5REFESyxFQURUO09BQUEsTUFBQTtBQUlFLGVBQU8sT0FBTyxDQUFDLGNBSmpCOztJQURHOzt1QkFPTCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7YUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsRUFBaUIsQ0FDZixtQkFEZSxFQUVmLHlCQUZlLEVBR2YsU0FIZSxpREFJb0QsQ0FBRSxnQkFBckUsR0FBQSxZQUFBLEdBQWEsT0FBTyxDQUFDLGdCQUFyQixHQUFBLE1BSmUsRUFLZixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FMZSxDQUFqQixFQU1LO1FBQUEsSUFBQSxFQUFNO1VBQ1AsSUFBQSxFQUFNLGtDQURDO1NBQU47T0FOTDtJQURROzs7O0tBaEI0QjtBQU54QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgW3Blcmx0aWR5XShodHRwOi8vcGVybHRpZHkuc291cmNlZm9yZ2UubmV0KVxuIyMjXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUGVybFRpZHkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiUGVybHRpZHlcIlxuICBsaW5rOiBcImh0dHA6Ly9wZXJsdGlkeS5zb3VyY2Vmb3JnZS5uZXQvXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFBlcmw6IHRydWVcbiAgfVxuXG4gIGNsaTogKG9wdGlvbnMpIC0+XG4gICAgaWYgbm90IG9wdGlvbnMucGVybHRpZHlfcGF0aD9cbiAgICAgIHJldHVybiBuZXcgRXJyb3IoXCInUGVybCBQZXJsdGlkeSBQYXRoJyBub3Qgc2V0IVwiICtcbiAgICAgICAgXCIgUGxlYXNlIHNldCB0aGlzIGluIHRoZSBBdG9tIEJlYXV0aWZ5IHBhY2thZ2Ugc2V0dGluZ3MuXCIpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIG9wdGlvbnMucGVybHRpZHlfcGF0aFxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQHJ1bihcInBlcmx0aWR5XCIsIFtcbiAgICAgICctLXN0YW5kYXJkLW91dHB1dCdcbiAgICAgICctLXN0YW5kYXJkLWVycm9yLW91dHB1dCdcbiAgICAgICctLXF1aWV0J1xuICAgICAgXCItLXByb2ZpbGU9I3tvcHRpb25zLnBlcmx0aWR5X3Byb2ZpbGV9XCIgaWYgb3B0aW9ucy5wZXJsdGlkeV9wcm9maWxlPy5sZW5ndGhcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdLCBoZWxwOiB7XG4gICAgICAgIGxpbms6IFwiaHR0cDovL3Blcmx0aWR5LnNvdXJjZWZvcmdlLm5ldC9cIlxuICAgICAgfSlcbiJdfQ==
