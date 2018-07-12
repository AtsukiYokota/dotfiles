(function() {
  module.exports = {
    name: "Fortran",
    namespace: "fortran",

    /*
    Supported Grammars
     */
    grammars: ["Fortran - Modern"],

    /*
    Supported extensions
     */
    extensions: ["f90", "F90", "f95", "F95", "f03", "F03", "f08", "F08"],

    /*
     */
    options: {
      emacs_path: {
        type: 'string',
        "default": "",
        description: "Path to the `emacs` executable"
      },
      emacs_script_path: {
        type: 'string',
        "default": "",
        description: "Path to the emacs script"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9mb3J0cmFuLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLFNBRlM7SUFHZixTQUFBLEVBQVcsU0FISTs7QUFLZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1Isa0JBRFEsQ0FSSzs7QUFZZjs7O0lBR0EsVUFBQSxFQUFZLENBQ1YsS0FEVSxFQUVWLEtBRlUsRUFHVixLQUhVLEVBSVYsS0FKVSxFQUtWLEtBTFUsRUFNVixLQU5VLEVBT1YsS0FQVSxFQVFWLEtBUlUsQ0FmRzs7QUEwQmY7O0lBR0EsT0FBQSxFQUVFO01BQUEsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxXQUFBLEVBQWEsZ0NBRmI7T0FERjtNQUlBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSwwQkFGYjtPQUxGO0tBL0JhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6IFwiRm9ydHJhblwiXG4gIG5hbWVzcGFjZTogXCJmb3J0cmFuXCJcblxuICAjIyNcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXG4gICMjI1xuICBncmFtbWFyczogW1xuICAgIFwiRm9ydHJhbiAtIE1vZGVyblwiXG4gIF1cblxuICAjIyNcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcbiAgIyMjXG4gIGV4dGVuc2lvbnM6IFtcbiAgICBcImY5MFwiXG4gICAgXCJGOTBcIlxuICAgIFwiZjk1XCJcbiAgICBcIkY5NVwiXG4gICAgXCJmMDNcIlxuICAgIFwiRjAzXCJcbiAgICBcImYwOFwiXG4gICAgXCJGMDhcIlxuICBdXG5cbiAgIyMjXG4gIFxuICAjIyNcbiAgb3B0aW9uczpcbiAgICAjIEphdmFTY3JpcHRcbiAgICBlbWFjc19wYXRoOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlBhdGggdG8gdGhlIGBlbWFjc2AgZXhlY3V0YWJsZVwiXG4gICAgZW1hY3Nfc2NyaXB0X3BhdGg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiUGF0aCB0byB0aGUgZW1hY3Mgc2NyaXB0XCJcblxufVxuIl19
