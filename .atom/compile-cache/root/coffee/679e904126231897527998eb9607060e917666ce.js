
/*
Requires [puppet-link](http://puppet-lint.com/)
 */

(function() {
  "use strict";
  var Beautifier, PuppetFix,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PuppetFix = (function(superClass) {
    extend(PuppetFix, superClass);

    function PuppetFix() {
      return PuppetFix.__super__.constructor.apply(this, arguments);
    }

    PuppetFix.prototype.name = "puppet-lint";

    PuppetFix.prototype.link = "http://puppet-lint.com/";

    PuppetFix.prototype.options = {
      Puppet: true
    };

    PuppetFix.prototype.executables = [
      {
        name: "puppet-lint",
        cmd: "puppet-lint",
        homepage: "http://puppet-lint.com/",
        installation: "http://puppet-lint.com/",
        version: {
          parse: function(text) {
            return text.match(/puppet-lint (\d+\.\d+\.\d+)/)[1];
          }
        },
        docker: {
          image: "unibeautify/puppet-lint"
        }
      }
    ];

    PuppetFix.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.exe("puppet-lint").run(['--fix', tempFile = this.tempFile("input", text)], {
        ignoreReturnCode: true,
        help: {
          link: "http://puppet-lint.com/"
        }
      }).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return PuppetFix;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3B1cHBldC1maXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBR0E7QUFIQSxNQUFBLHFCQUFBO0lBQUE7OztFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFFckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUVOLE9BQUEsR0FBUztNQUNQLE1BQUEsRUFBUSxJQUREOzs7d0JBSVQsV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sYUFEUjtRQUVFLEdBQUEsRUFBSyxhQUZQO1FBR0UsUUFBQSxFQUFVLHlCQUhaO1FBSUUsWUFBQSxFQUFjLHlCQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyw2QkFBWCxDQUEwQyxDQUFBLENBQUE7VUFBcEQsQ0FEQTtTQUxYO1FBUUUsTUFBQSxFQUFRO1VBQ04sS0FBQSxFQUFPLHlCQUREO1NBUlY7T0FEVzs7O3dCQWViLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTthQUFBLElBQUMsQ0FBQSxHQUFELENBQUssYUFBTCxDQUFtQixDQUFDLEdBQXBCLENBQXdCLENBQ3RCLE9BRHNCLEVBRXRCLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FGVyxDQUF4QixFQUdLO1FBQ0QsZ0JBQUEsRUFBa0IsSUFEakI7UUFFRCxJQUFBLEVBQU07VUFDSixJQUFBLEVBQU0seUJBREY7U0FGTDtPQUhMLENBU0UsQ0FBQyxJQVRILENBU1EsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVRSO0lBRFE7Ozs7S0F4QjZCO0FBTnpDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBbcHVwcGV0LWxpbmtdKGh0dHA6Ly9wdXBwZXQtbGludC5jb20vKVxuIyMjXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHVwcGV0Rml4IGV4dGVuZHMgQmVhdXRpZmllclxuICAjIHRoaXMgaXMgd2hhdCBkaXNwbGF5cyBhcyB5b3VyIERlZmF1bHQgQmVhdXRpZmllciBpbiBMYW5ndWFnZSBDb25maWdcbiAgbmFtZTogXCJwdXBwZXQtbGludFwiXG4gIGxpbms6IFwiaHR0cDovL3B1cHBldC1saW50LmNvbS9cIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBQdXBwZXQ6IHRydWVcbiAgfVxuXG4gIGV4ZWN1dGFibGVzOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJwdXBwZXQtbGludFwiXG4gICAgICBjbWQ6IFwicHVwcGV0LWxpbnRcIlxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cDovL3B1cHBldC1saW50LmNvbS9cIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHA6Ly9wdXBwZXQtbGludC5jb20vXCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC9wdXBwZXQtbGludCAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXG4gICAgICB9XG4gICAgICBkb2NrZXI6IHtcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvcHVwcGV0LWxpbnRcIlxuICAgICAgfVxuICAgIH1cbiAgXVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQGV4ZShcInB1cHBldC1saW50XCIpLnJ1bihbXG4gICAgICAnLS1maXgnXG4gICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdLCB7XG4gICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgICAgaGVscDoge1xuICAgICAgICAgIGxpbms6IFwiaHR0cDovL3B1cHBldC1saW50LmNvbS9cIlxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4oPT5cbiAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgKVxuIl19
