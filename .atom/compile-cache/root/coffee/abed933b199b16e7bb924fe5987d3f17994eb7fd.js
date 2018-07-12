
/*
 */

(function() {
  "use strict";
  var Beautifier, Gherkin,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Gherkin = (function(superClass) {
    extend(Gherkin, superClass);

    function Gherkin() {
      return Gherkin.__super__.constructor.apply(this, arguments);
    }

    Gherkin.prototype.name = "Gherkin formatter";

    Gherkin.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/gherkin.coffee";

    Gherkin.prototype.options = {
      gherkin: true
    };

    Gherkin.prototype.beautify = function(text, language, options) {
      var Lexer, logger;
      Lexer = require('gherkin').Lexer('en');
      logger = this.logger;
      return new this.Promise(function(resolve, reject) {
        var i, len, lexer, line, loggerLevel, recorder, ref;
        recorder = {
          lines: [],
          tags: [],
          comments: [],
          last_obj: null,
          indent_to: function(indent_level) {
            if (indent_level == null) {
              indent_level = 0;
            }
            return options.indent_char.repeat(options.indent_size * indent_level);
          },
          write_blank: function() {
            return this.lines.push('');
          },
          write_indented: function(content, indent) {
            var i, len, line, ref, results;
            if (indent == null) {
              indent = 0;
            }
            ref = content.trim().split("\n");
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              line = ref[i];
              results.push(this.lines.push("" + (this.indent_to(indent)) + (line.trim())));
            }
            return results;
          },
          write_comments: function(indent) {
            var comment, i, len, ref, results;
            if (indent == null) {
              indent = 0;
            }
            ref = this.comments.splice(0, this.comments.length);
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              comment = ref[i];
              results.push(this.write_indented(comment, indent));
            }
            return results;
          },
          write_tags: function(indent) {
            if (indent == null) {
              indent = 0;
            }
            if (this.tags.length > 0) {
              return this.write_indented(this.tags.splice(0, this.tags.length).join(' '), indent);
            }
          },
          comment: function(value, line) {
            logger.verbose({
              token: 'comment',
              value: value.trim(),
              line: line
            });
            return this.comments.push(value);
          },
          tag: function(value, line) {
            logger.verbose({
              token: 'tag',
              value: value,
              line: line
            });
            return this.tags.push(value);
          },
          feature: function(keyword, name, description, line) {
            logger.verbose({
              token: 'feature',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_comments(0);
            this.write_tags(0);
            this.write_indented(keyword + ": " + name, '');
            if (description) {
              return this.write_indented(description, 1);
            }
          },
          background: function(keyword, name, description, line) {
            logger.verbose({
              token: 'background',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_blank();
            this.write_comments(1);
            this.write_indented(keyword + ": " + name, 1);
            if (description) {
              return this.write_indented(description, 2);
            }
          },
          scenario: function(keyword, name, description, line) {
            logger.verbose({
              token: 'scenario',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_blank();
            this.write_comments(1);
            this.write_tags(1);
            this.write_indented(keyword + ": " + name, 1);
            if (description) {
              return this.write_indented(description, 2);
            }
          },
          scenario_outline: function(keyword, name, description, line) {
            logger.verbose({
              token: 'outline',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_blank();
            this.write_comments(1);
            this.write_tags(1);
            this.write_indented(keyword + ": " + name, 1);
            if (description) {
              return this.write_indented(description, 2);
            }
          },
          examples: function(keyword, name, description, line) {
            logger.verbose({
              token: 'examples',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_blank();
            this.write_comments(2);
            this.write_tags(2);
            this.write_indented(keyword + ": " + name, 2);
            if (description) {
              return this.write_indented(description, 3);
            }
          },
          step: function(keyword, name, line) {
            logger.verbose({
              token: 'step',
              keyword: keyword,
              name: name,
              line: line
            });
            this.write_comments(2);
            return this.write_indented("" + keyword + name, 2);
          },
          doc_string: function(content_type, string, line) {
            var three_quotes;
            logger.verbose({
              token: 'doc_string',
              content_type: content_type,
              string: string,
              line: line
            });
            three_quotes = '"""';
            this.write_comments(2);
            return this.write_indented("" + three_quotes + content_type + "\n" + string + "\n" + three_quotes, 3);
          },
          row: function(cells, line) {
            logger.verbose({
              token: 'row',
              cells: cells,
              line: line
            });
            this.write_comments(3);
            return this.write_indented("| " + (cells.join(' | ')) + " |", 3);
          },
          eof: function() {
            logger.verbose({
              token: 'eof'
            });
            return this.write_comments(2);
          }
        };
        lexer = new Lexer(recorder);
        lexer.scan(text);
        loggerLevel = typeof atom !== "undefined" && atom !== null ? atom.config.get('atom-beautify.general.loggerLevel') : void 0;
        if (loggerLevel === 'verbose') {
          ref = recorder.lines;
          for (i = 0, len = ref.length; i < len; i++) {
            line = ref[i];
            logger.verbose("> " + line);
          }
        }
        return resolve(recorder.lines.join("\n"));
      });
    };

    return Gherkin;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2doZXJraW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0FBQUE7RUFHQTtBQUhBLE1BQUEsbUJBQUE7SUFBQTs7O0VBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3NCQUNyQixJQUFBLEdBQU07O3NCQUNOLElBQUEsR0FBTTs7c0JBRU4sT0FBQSxHQUFTO01BQ1AsT0FBQSxFQUFTLElBREY7OztzQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FBa0IsQ0FBQyxLQUFuQixDQUF5QixJQUF6QjtNQUNSLE1BQUEsR0FBUyxJQUFDLENBQUE7QUFDVixhQUFPLElBQUksSUFBQyxDQUFBLE9BQUwsQ0FBYSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2xCLFlBQUE7UUFBQSxRQUFBLEdBQVc7VUFDVCxLQUFBLEVBQU8sRUFERTtVQUVULElBQUEsRUFBTSxFQUZHO1VBR1QsUUFBQSxFQUFVLEVBSEQ7VUFLVCxRQUFBLEVBQVUsSUFMRDtVQU9ULFNBQUEsRUFBVyxTQUFDLFlBQUQ7O2NBQUMsZUFBZTs7QUFDekIsbUJBQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQyxNQUFwQixDQUEyQixPQUFPLENBQUMsV0FBUixHQUFzQixZQUFqRDtVQURFLENBUEY7VUFVVCxXQUFBLEVBQWEsU0FBQTttQkFDWCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxFQUFaO1VBRFcsQ0FWSjtVQWFULGNBQUEsRUFBZ0IsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNkLGdCQUFBOztjQUR3QixTQUFTOztBQUNqQztBQUFBO2lCQUFBLHFDQUFB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QUE5RTtVQUxVLENBbEZIO1VBeUZULEdBQUEsRUFBSyxTQUFDLEtBQUQsRUFBUSxJQUFSO1lBQ0gsTUFBTSxDQUFDLE9BQVAsQ0FBZTtjQUFDLEtBQUEsRUFBTyxLQUFSO2NBQWUsS0FBQSxFQUFPLEtBQXRCO2NBQTZCLElBQUEsRUFBTSxJQUFuQzthQUFmO1lBSUEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBaEI7bUJBQ0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQSxHQUFJLENBQUMsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFYLENBQUQsQ0FBSixHQUF1QixJQUF2QyxFQUE0QyxDQUE1QztVQU5HLENBekZJO1VBaUdULEdBQUEsRUFBSyxTQUFBO1lBQ0gsTUFBTSxDQUFDLE9BQVAsQ0FBZTtjQUFDLEtBQUEsRUFBTyxLQUFSO2FBQWY7bUJBRUEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBaEI7VUFIRyxDQWpHSTs7UUF1R1gsS0FBQSxHQUFRLElBQUksS0FBSixDQUFVLFFBQVY7UUFDUixLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7UUFFQSxXQUFBLGtEQUFjLElBQUksQ0FBRSxNQUFNLENBQUMsR0FBYixDQUFpQixtQ0FBakI7UUFDZCxJQUFHLFdBQUEsS0FBZSxTQUFsQjtBQUNFO0FBQUEsZUFBQSxxQ0FBQTs7WUFDRSxNQUFNLENBQUMsT0FBUCxDQUFlLElBQUEsR0FBSyxJQUFwQjtBQURGLFdBREY7O2VBSUEsT0FBQSxDQUFRLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBZixDQUFvQixJQUFwQixDQUFSO01BaEhrQixDQUFiO0lBSEM7Ozs7S0FSMkI7QUFOdkMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgR2hlcmtpbiBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJHaGVya2luIGZvcm1hdHRlclwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0dsYXZpbjAwMS9hdG9tLWJlYXV0aWZ5L2Jsb2IvbWFzdGVyL3NyYy9iZWF1dGlmaWVycy9naGVya2luLmNvZmZlZVwiXG5cbiAgb3B0aW9uczoge1xuICAgIGdoZXJraW46IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgTGV4ZXIgPSByZXF1aXJlKCdnaGVya2luJykuTGV4ZXIoJ2VuJylcbiAgICBsb2dnZXIgPSBAbG9nZ2VyXG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgcmVjb3JkZXIgPSB7XG4gICAgICAgIGxpbmVzOiBbXVxuICAgICAgICB0YWdzOiBbXVxuICAgICAgICBjb21tZW50czogW11cblxuICAgICAgICBsYXN0X29iajogbnVsbFxuXG4gICAgICAgIGluZGVudF90bzogKGluZGVudF9sZXZlbCA9IDApIC0+XG4gICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW5kZW50X2NoYXIucmVwZWF0KG9wdGlvbnMuaW5kZW50X3NpemUgKiBpbmRlbnRfbGV2ZWwpXG5cbiAgICAgICAgd3JpdGVfYmxhbms6ICgpIC0+XG4gICAgICAgICAgQGxpbmVzLnB1c2goJycpXG5cbiAgICAgICAgd3JpdGVfaW5kZW50ZWQ6IChjb250ZW50LCBpbmRlbnQgPSAwKSAtPlxuICAgICAgICAgIGZvciBsaW5lIGluIGNvbnRlbnQudHJpbSgpLnNwbGl0KFwiXFxuXCIpXG4gICAgICAgICAgICBAbGluZXMucHVzaChcIiN7QGluZGVudF90byhpbmRlbnQpfSN7bGluZS50cmltKCl9XCIpXG5cbiAgICAgICAgd3JpdGVfY29tbWVudHM6IChpbmRlbnQgPSAwKSAtPlxuICAgICAgICAgIGZvciBjb21tZW50IGluIEBjb21tZW50cy5zcGxpY2UoMCwgQGNvbW1lbnRzLmxlbmd0aClcbiAgICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChjb21tZW50LCBpbmRlbnQpXG5cbiAgICAgICAgd3JpdGVfdGFnczogKGluZGVudCA9IDApIC0+XG4gICAgICAgICAgaWYgQHRhZ3MubGVuZ3RoID4gMFxuICAgICAgICAgICAgQHdyaXRlX2luZGVudGVkKEB0YWdzLnNwbGljZSgwLCBAdGFncy5sZW5ndGgpLmpvaW4oJyAnKSwgaW5kZW50KVxuXG4gICAgICAgIGNvbW1lbnQ6ICh2YWx1ZSwgbGluZSkgLT5cbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSh7dG9rZW46ICdjb21tZW50JywgdmFsdWU6IHZhbHVlLnRyaW0oKSwgbGluZTogbGluZX0pXG4gICAgICAgICAgQGNvbW1lbnRzLnB1c2godmFsdWUpXG5cbiAgICAgICAgdGFnOiAodmFsdWUsIGxpbmUpIC0+XG4gICAgICAgICAgbG9nZ2VyLnZlcmJvc2Uoe3Rva2VuOiAndGFnJywgdmFsdWU6IHZhbHVlLCBsaW5lOiBsaW5lfSlcbiAgICAgICAgICBAdGFncy5wdXNoKHZhbHVlKVxuXG4gICAgICAgIGZlYXR1cmU6IChrZXl3b3JkLCBuYW1lLCBkZXNjcmlwdGlvbiwgbGluZSkgLT5cbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSh7dG9rZW46ICdmZWF0dXJlJywga2V5d29yZDoga2V5d29yZCwgbmFtZTogbmFtZSwgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLCBsaW5lOiBsaW5lfSlcblxuICAgICAgICAgIEB3cml0ZV9jb21tZW50cygwKVxuICAgICAgICAgIEB3cml0ZV90YWdzKDApXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKFwiI3trZXl3b3JkfTogI3tuYW1lfVwiLCAnJylcbiAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoZGVzY3JpcHRpb24sIDEpIGlmIGRlc2NyaXB0aW9uXG5cbiAgICAgICAgYmFja2dyb3VuZDogKGtleXdvcmQsIG5hbWUsIGRlc2NyaXB0aW9uLCBsaW5lKSAtPlxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKHt0b2tlbjogJ2JhY2tncm91bmQnLCBrZXl3b3JkOiBrZXl3b3JkLCBuYW1lOiBuYW1lLCBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sIGxpbmU6IGxpbmV9KVxuXG4gICAgICAgICAgQHdyaXRlX2JsYW5rKClcbiAgICAgICAgICBAd3JpdGVfY29tbWVudHMoMSlcbiAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoXCIje2tleXdvcmR9OiAje25hbWV9XCIsIDEpXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKGRlc2NyaXB0aW9uLCAyKSBpZiBkZXNjcmlwdGlvblxuXG4gICAgICAgIHNjZW5hcmlvOiAoa2V5d29yZCwgbmFtZSwgZGVzY3JpcHRpb24sIGxpbmUpIC0+XG4gICAgICAgICAgbG9nZ2VyLnZlcmJvc2Uoe3Rva2VuOiAnc2NlbmFyaW8nLCBrZXl3b3JkOiBrZXl3b3JkLCBuYW1lOiBuYW1lLCBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sIGxpbmU6IGxpbmV9KVxuXG4gICAgICAgICAgQHdyaXRlX2JsYW5rKClcbiAgICAgICAgICBAd3JpdGVfY29tbWVudHMoMSlcbiAgICAgICAgICBAd3JpdGVfdGFncygxKVxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChcIiN7a2V5d29yZH06ICN7bmFtZX1cIiwgMSlcbiAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoZGVzY3JpcHRpb24sIDIpIGlmIGRlc2NyaXB0aW9uXG5cbiAgICAgICAgc2NlbmFyaW9fb3V0bGluZTogKGtleXdvcmQsIG5hbWUsIGRlc2NyaXB0aW9uLCBsaW5lKSAtPlxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKHt0b2tlbjogJ291dGxpbmUnLCBrZXl3b3JkOiBrZXl3b3JkLCBuYW1lOiBuYW1lLCBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sIGxpbmU6IGxpbmV9KVxuXG4gICAgICAgICAgQHdyaXRlX2JsYW5rKClcbiAgICAgICAgICBAd3JpdGVfY29tbWVudHMoMSlcbiAgICAgICAgICBAd3JpdGVfdGFncygxKVxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChcIiN7a2V5d29yZH06ICN7bmFtZX1cIiwgMSlcbiAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoZGVzY3JpcHRpb24sIDIpIGlmIGRlc2NyaXB0aW9uXG5cbiAgICAgICAgZXhhbXBsZXM6IChrZXl3b3JkLCBuYW1lLCBkZXNjcmlwdGlvbiwgbGluZSkgLT5cbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSh7dG9rZW46ICdleGFtcGxlcycsIGtleXdvcmQ6IGtleXdvcmQsIG5hbWU6IG5hbWUsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiwgbGluZTogbGluZX0pXG5cbiAgICAgICAgICBAd3JpdGVfYmxhbmsoKVxuICAgICAgICAgIEB3cml0ZV9jb21tZW50cygyKVxuICAgICAgICAgIEB3cml0ZV90YWdzKDIpXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKFwiI3trZXl3b3JkfTogI3tuYW1lfVwiLCAyKVxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChkZXNjcmlwdGlvbiwgMykgaWYgZGVzY3JpcHRpb25cblxuICAgICAgICBzdGVwOiAoa2V5d29yZCwgbmFtZSwgbGluZSkgLT5cbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSh7dG9rZW46ICdzdGVwJywga2V5d29yZDoga2V5d29yZCwgbmFtZTogbmFtZSwgbGluZTogbGluZX0pXG5cbiAgICAgICAgICBAd3JpdGVfY29tbWVudHMoMilcbiAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoXCIje2tleXdvcmR9I3tuYW1lfVwiLCAyKVxuXG4gICAgICAgIGRvY19zdHJpbmc6IChjb250ZW50X3R5cGUsIHN0cmluZywgbGluZSkgLT5cbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSh7dG9rZW46ICdkb2Nfc3RyaW5nJywgY29udGVudF90eXBlOiBjb250ZW50X3R5cGUsIHN0cmluZzogc3RyaW5nLCBsaW5lOiBsaW5lfSlcbiAgICAgICAgICB0aHJlZV9xdW90ZXMgPSAnXCJcIlwiJ1xuXG4gICAgICAgICAgQHdyaXRlX2NvbW1lbnRzKDIpXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKFwiI3t0aHJlZV9xdW90ZXN9I3tjb250ZW50X3R5cGV9XFxuI3tzdHJpbmd9XFxuI3t0aHJlZV9xdW90ZXN9XCIsIDMpXG5cbiAgICAgICAgcm93OiAoY2VsbHMsIGxpbmUpIC0+XG4gICAgICAgICAgbG9nZ2VyLnZlcmJvc2Uoe3Rva2VuOiAncm93JywgY2VsbHM6IGNlbGxzLCBsaW5lOiBsaW5lfSlcblxuICAgICAgICAgICMgVE9ETzogbmVlZCB0byBjb2xsZWN0IHJvd3Mgc28gdGhhdCB3ZSBjYW4gYWxpZ24gdGhlIHZlcnRpY2FsIHBpcGVzIHRvIHRoZSB3aWRlc3QgY29sdW1uc1xuICAgICAgICAgICMgU2VlIEdoZXJraW46OkZvcm1hdHRlcjo6UHJldHR5Rm9ybWF0dGVyI3RhYmxlKHJvd3MpXG4gICAgICAgICAgQHdyaXRlX2NvbW1lbnRzKDMpXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKFwifCAje2NlbGxzLmpvaW4oJyB8ICcpfSB8XCIsIDMpXG5cbiAgICAgICAgZW9mOiAoKSAtPlxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKHt0b2tlbjogJ2VvZid9KVxuICAgICAgICAgICMgSWYgdGhlcmUgd2VyZSBhbnkgY29tbWVudHMgbGVmdCwgdHJlYXQgdGhlbSBhcyBzdGVwIGNvbW1lbnRzLlxuICAgICAgICAgIEB3cml0ZV9jb21tZW50cygyKVxuICAgICAgfVxuXG4gICAgICBsZXhlciA9IG5ldyBMZXhlcihyZWNvcmRlcilcbiAgICAgIGxleGVyLnNjYW4odGV4dClcblxuICAgICAgbG9nZ2VyTGV2ZWwgPSBhdG9tPy5jb25maWcuZ2V0KCdhdG9tLWJlYXV0aWZ5LmdlbmVyYWwubG9nZ2VyTGV2ZWwnKVxuICAgICAgaWYgbG9nZ2VyTGV2ZWwgaXMgJ3ZlcmJvc2UnXG4gICAgICAgIGZvciBsaW5lIGluIHJlY29yZGVyLmxpbmVzXG4gICAgICAgICAgbG9nZ2VyLnZlcmJvc2UoXCI+ICN7bGluZX1cIilcblxuICAgICAgcmVzb2x2ZSByZWNvcmRlci5saW5lcy5qb2luKFwiXFxuXCIpXG4gICAgKVxuIl19
