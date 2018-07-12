(function() {
  module.exports = function(string) {
    if (string) {
      return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    } else {
      return '';
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2hpZ2hsaWdodC1zZWxlY3RlZC9saWIvZXNjYXBlLXJlZy1leHAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxNQUFEO0lBQ2YsSUFBRyxNQUFIO2FBQ0UsTUFBTSxDQUFDLE9BQVAsQ0FBZSx3QkFBZixFQUF5QyxNQUF6QyxFQURGO0tBQUEsTUFBQTthQUdFLEdBSEY7O0VBRGU7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3VuZGVyc2NvcmUtcGx1cy9ibG9iLzRhMDIyY2Y3Mi9zcmMvdW5kZXJzY29yZS1wbHVzLmNvZmZlZSNMMTM2LUwxNDBcblxubW9kdWxlLmV4cG9ydHMgPSAoc3RyaW5nKSAtPlxuICBpZiBzdHJpbmdcbiAgICBzdHJpbmcucmVwbGFjZSgvWy1cXC9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCAnXFxcXCQmJylcbiAgZWxzZVxuICAgICcnXG4iXX0=
