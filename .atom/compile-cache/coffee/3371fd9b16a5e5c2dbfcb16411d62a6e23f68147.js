(function() {
  var slice = [].slice;

  module.exports = {
    prefix: 'autocomplete-python:',
    debug: function() {
      var msg;
      msg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (atom.config.get('autocomplete-python.outputDebug')) {
        return console.debug.apply(console, [this.prefix].concat(slice.call(msg)));
      }
    },
    warning: function() {
      var msg;
      msg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return console.warn.apply(console, [this.prefix].concat(slice.call(msg)));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL2xvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsc0JBQVI7SUFDQSxLQUFBLEVBQU8sU0FBQTtBQUNMLFVBQUE7TUFETTtNQUNOLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixDQUFIO0FBQ0UsZUFBTyxPQUFPLENBQUMsS0FBUixnQkFBYyxDQUFBLElBQUMsQ0FBQSxNQUFRLFNBQUEsV0FBQSxHQUFBLENBQUEsQ0FBdkIsRUFEVDs7SUFESyxDQURQO0lBS0EsT0FBQSxFQUFTLFNBQUE7QUFDUCxVQUFBO01BRFE7QUFDUixhQUFPLE9BQU8sQ0FBQyxJQUFSLGdCQUFhLENBQUEsSUFBQyxDQUFBLE1BQVEsU0FBQSxXQUFBLEdBQUEsQ0FBQSxDQUF0QjtJQURBLENBTFQ7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIHByZWZpeDogJ2F1dG9jb21wbGV0ZS1weXRob246J1xuICBkZWJ1ZzogKG1zZy4uLikgLT5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24ub3V0cHV0RGVidWcnKVxuICAgICAgcmV0dXJuIGNvbnNvbGUuZGVidWcgQHByZWZpeCwgbXNnLi4uXG5cbiAgd2FybmluZzogKG1zZy4uLikgLT5cbiAgICByZXR1cm4gY29uc29sZS53YXJuIEBwcmVmaXgsIG1zZy4uLlxuIl19
