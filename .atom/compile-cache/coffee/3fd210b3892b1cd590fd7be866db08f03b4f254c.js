(function() {
  module.exports = {
    name: "Jade",
    namespace: "jade",
    fallback: ['html'],
    scope: ['text.jade'],

    /*
    Supported Grammars
     */
    grammars: ["Jade", "Pug"],

    /*
    Supported extensions
     */
    extensions: ["jade", "pug"],
    options: [
      {
        indent_size: {
          type: 'integer',
          "default": null,
          minimum: 0,
          description: "Indentation size/length"
        },
        indent_char: {
          type: 'string',
          "default": null,
          description: "Indentation character"
        },
        omit_div: {
          type: 'boolean',
          "default": false,
          description: "Whether to omit/remove the 'div' tags."
        }
      }
    ],
    defaultBeautifier: "Pug Beautify"
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9qYWRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLE1BRlM7SUFHZixTQUFBLEVBQVcsTUFISTtJQUlmLFFBQUEsRUFBVSxDQUFDLE1BQUQsQ0FKSztJQUtmLEtBQUEsRUFBTyxDQUFDLFdBQUQsQ0FMUTs7QUFPZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsTUFEUSxFQUNBLEtBREEsQ0FWSzs7QUFjZjs7O0lBR0EsVUFBQSxFQUFZLENBQ1YsTUFEVSxFQUNGLEtBREUsQ0FqQkc7SUFxQmYsT0FBQSxFQUFTO01BQ1A7UUFBQSxXQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sU0FBTjtVQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtVQUVBLE9BQUEsRUFBUyxDQUZUO1VBR0EsV0FBQSxFQUFhLHlCQUhiO1NBREY7UUFLQSxXQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sUUFBTjtVQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtVQUVBLFdBQUEsRUFBYSx1QkFGYjtTQU5GO1FBU0EsUUFBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLFNBQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7VUFFQSxXQUFBLEVBQWEsd0NBRmI7U0FWRjtPQURPO0tBckJNO0lBcUNmLGlCQUFBLEVBQW1CLGNBckNKOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6IFwiSmFkZVwiXG4gIG5hbWVzcGFjZTogXCJqYWRlXCJcbiAgZmFsbGJhY2s6IFsnaHRtbCddXG4gIHNjb3BlOiBbJ3RleHQuamFkZSddXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xuICAjIyNcbiAgZ3JhbW1hcnM6IFtcbiAgICBcIkphZGVcIiwgXCJQdWdcIlxuICBdXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgXCJqYWRlXCIsIFwicHVnXCJcbiAgXVxuXG4gIG9wdGlvbnM6IFtcbiAgICBpbmRlbnRfc2l6ZTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgbWluaW11bTogMFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gc2l6ZS9sZW5ndGhcIlxuICAgIGluZGVudF9jaGFyOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIGNoYXJhY3RlclwiXG4gICAgb21pdF9kaXY6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJXaGV0aGVyIHRvIG9taXQvcmVtb3ZlIHRoZSAnZGl2JyB0YWdzLlwiXG4gIF1cblxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJQdWcgQmVhdXRpZnlcIlxuXG59XG4iXX0=
