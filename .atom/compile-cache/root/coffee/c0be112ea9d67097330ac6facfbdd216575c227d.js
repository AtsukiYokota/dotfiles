(function() {
  "use strict";
  var Beautifier, Remark,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Remark = (function(superClass) {
    extend(Remark, superClass);

    function Remark() {
      return Remark.__super__.constructor.apply(this, arguments);
    }

    Remark.prototype.name = "Remark";

    Remark.prototype.link = "https://github.com/remarkjs/remark";

    Remark.prototype.options = {
      _: {
        gfm: true,
        yaml: true,
        commonmark: true,
        footnotes: true,
        pedantic: true,
        breaks: true,
        entities: true,
        setext: true,
        closeAtx: true,
        looseTable: true,
        spacedTable: true,
        fence: true,
        fences: true,
        bullet: true,
        listItemIndent: true,
        incrementListMarker: true,
        rule: true,
        ruleRepetition: true,
        ruleSpaces: true,
        strong: true,
        emphasis: true,
        position: true
      },
      Markdown: true
    };

    Remark.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var cleanMarkdown, err, remark;
        try {
          remark = require('remark');
          cleanMarkdown = remark().process(text, options).toString();
          return resolve(cleanMarkdown);
        } catch (error) {
          err = error;
          this.error("Remark error: " + err);
          return reject(err);
        }
      });
    };

    return Remark;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3JlbWFyay5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEsa0JBQUE7SUFBQTs7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3FCQUNyQixJQUFBLEdBQU07O3FCQUNOLElBQUEsR0FBTTs7cUJBQ04sT0FBQSxHQUFTO01BQ1AsQ0FBQSxFQUFHO1FBQ0QsR0FBQSxFQUFLLElBREo7UUFFRCxJQUFBLEVBQU0sSUFGTDtRQUdELFVBQUEsRUFBWSxJQUhYO1FBSUQsU0FBQSxFQUFXLElBSlY7UUFLRCxRQUFBLEVBQVUsSUFMVDtRQU1ELE1BQUEsRUFBUSxJQU5QO1FBT0QsUUFBQSxFQUFVLElBUFQ7UUFRRCxNQUFBLEVBQVEsSUFSUDtRQVNELFFBQUEsRUFBVSxJQVRUO1FBVUQsVUFBQSxFQUFZLElBVlg7UUFXRCxXQUFBLEVBQWEsSUFYWjtRQVlELEtBQUEsRUFBTyxJQVpOO1FBYUQsTUFBQSxFQUFRLElBYlA7UUFjRCxNQUFBLEVBQVEsSUFkUDtRQWVELGNBQUEsRUFBZ0IsSUFmZjtRQWdCRCxtQkFBQSxFQUFxQixJQWhCcEI7UUFpQkQsSUFBQSxFQUFNLElBakJMO1FBa0JELGNBQUEsRUFBZ0IsSUFsQmY7UUFtQkQsVUFBQSxFQUFZLElBbkJYO1FBb0JELE1BQUEsRUFBUSxJQXBCUDtRQXFCRCxRQUFBLEVBQVUsSUFyQlQ7UUFzQkQsUUFBQSxFQUFVLElBdEJUO09BREk7TUF5QlAsUUFBQSxFQUFVLElBekJIOzs7cUJBNEJULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsYUFBTyxJQUFJLElBQUMsQ0FBQSxPQUFMLENBQWEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixZQUFBO0FBQUE7VUFDRSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7VUFDVCxhQUFBLEdBQWdCLE1BQUEsQ0FBQSxDQUFRLENBQUMsT0FBVCxDQUFpQixJQUFqQixFQUF1QixPQUF2QixDQUErQixDQUFDLFFBQWhDLENBQUE7aUJBQ2hCLE9BQUEsQ0FBUSxhQUFSLEVBSEY7U0FBQSxhQUFBO1VBSU07VUFDSixJQUFDLENBQUEsS0FBRCxDQUFPLGdCQUFBLEdBQWlCLEdBQXhCO2lCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBTkY7O01BRGtCLENBQWI7SUFEQzs7OztLQS9CMEI7QUFIdEMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUmVtYXJrIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlJlbWFya1wiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3JlbWFya2pzL3JlbWFya1wiXG4gIG9wdGlvbnM6IHtcbiAgICBfOiB7XG4gICAgICBnZm06IHRydWVcbiAgICAgIHlhbWw6IHRydWVcbiAgICAgIGNvbW1vbm1hcms6IHRydWVcbiAgICAgIGZvb3Rub3RlczogdHJ1ZVxuICAgICAgcGVkYW50aWM6IHRydWVcbiAgICAgIGJyZWFrczogdHJ1ZVxuICAgICAgZW50aXRpZXM6IHRydWVcbiAgICAgIHNldGV4dDogdHJ1ZVxuICAgICAgY2xvc2VBdHg6IHRydWVcbiAgICAgIGxvb3NlVGFibGU6IHRydWVcbiAgICAgIHNwYWNlZFRhYmxlOiB0cnVlXG4gICAgICBmZW5jZTogdHJ1ZVxuICAgICAgZmVuY2VzOiB0cnVlXG4gICAgICBidWxsZXQ6IHRydWVcbiAgICAgIGxpc3RJdGVtSW5kZW50OiB0cnVlXG4gICAgICBpbmNyZW1lbnRMaXN0TWFya2VyOiB0cnVlXG4gICAgICBydWxlOiB0cnVlXG4gICAgICBydWxlUmVwZXRpdGlvbjogdHJ1ZVxuICAgICAgcnVsZVNwYWNlczogdHJ1ZVxuICAgICAgc3Ryb25nOiB0cnVlXG4gICAgICBlbXBoYXNpczogdHJ1ZVxuICAgICAgcG9zaXRpb246IHRydWVcbiAgICB9XG4gICAgTWFya2Rvd246IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgdHJ5XG4gICAgICAgIHJlbWFyayA9IHJlcXVpcmUgJ3JlbWFyaydcbiAgICAgICAgY2xlYW5NYXJrZG93biA9IHJlbWFyaygpLnByb2Nlc3ModGV4dCwgb3B0aW9ucykudG9TdHJpbmcoKVxuICAgICAgICByZXNvbHZlIGNsZWFuTWFya2Rvd25cbiAgICAgIGNhdGNoIGVyclxuICAgICAgICBAZXJyb3IoXCJSZW1hcmsgZXJyb3I6ICN7ZXJyfVwiKVxuICAgICAgICByZWplY3QoZXJyKVxuICAgIClcbiJdfQ==
