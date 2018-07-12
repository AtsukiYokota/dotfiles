(function() {
  module.exports = {
    name: "GLSL",
    namespace: "glsl",

    /*
    Supported Grammars
     */
    grammars: ["C", "opencl", "GLSL"],

    /*
    Supported extensions
     */
    extensions: ["vert", "frag"],
    options: {
      configPath: {
        type: 'string',
        "default": "",
        description: "Path to clang-format config file. i.e. clang-format.cfg"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9nbHNsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLE1BRlM7SUFHZixTQUFBLEVBQVcsTUFISTs7QUFLZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsR0FEUSxFQUVSLFFBRlEsRUFHUixNQUhRLENBUks7O0FBY2Y7OztJQUdBLFVBQUEsRUFBWSxDQUNWLE1BRFUsRUFFVixNQUZVLENBakJHO0lBc0JmLE9BQUEsRUFDRTtNQUFBLFVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsV0FBQSxFQUFhLHlEQUZiO09BREY7S0F2QmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogXCJHTFNMXCJcbiAgbmFtZXNwYWNlOiBcImdsc2xcIlxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJDXCJcbiAgICBcIm9wZW5jbFwiXG4gICAgXCJHTFNMXCJcbiAgXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAjIyNcbiAgZXh0ZW5zaW9uczogW1xuICAgIFwidmVydFwiXG4gICAgXCJmcmFnXCJcbiAgXVxuXG4gIG9wdGlvbnM6XG4gICAgY29uZmlnUGF0aDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJQYXRoIHRvIGNsYW5nLWZvcm1hdCBjb25maWcgZmlsZS4gaS5lLiBjbGFuZy1mb3JtYXQuY2ZnXCJcblxufVxuIl19
