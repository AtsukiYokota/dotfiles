(function() {
  module.exports = {
    name: "Python",
    namespace: "python",
    scope: ['source.python'],

    /*
    Supported Grammars
     */
    grammars: ["Python", "MagicPython"],

    /*
    Supported extensions
     */
    extensions: ["py"],
    options: {
      max_line_length: {
        type: 'integer',
        "default": 79,
        description: "set maximum allowed line length"
      },
      indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indentation size/length"
      },
      ignore: {
        type: 'array',
        "default": ["E24"],
        items: {
          type: 'string'
        },
        description: "do not fix these errors/warnings"
      },
      formatter: {
        type: 'string',
        "default": 'autopep8',
        "enum": ['autopep8', 'yapf'],
        description: "formatter used by pybeautifier"
      },
      style_config: {
        type: 'string',
        "default": 'pep8',
        description: "formatting style used by yapf"
      },
      sort_imports: {
        type: 'boolean',
        "default": false,
        description: "sort imports (requires isort installed)"
      },
      multi_line_output: {
        type: 'string',
        "default": 'Hanging Grid Grouped',
        "enum": ['Grid', 'Vertical', 'Hanging Indent', 'Vertical Hanging Indent', 'Hanging Grid', 'Hanging Grid Grouped', 'NOQA'],
        description: "defines how from imports wrap (requires isort installed)"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9weXRob24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sUUFGUztJQUdmLFNBQUEsRUFBVyxRQUhJO0lBSWYsS0FBQSxFQUFPLENBQUMsZUFBRCxDQUpROztBQU1mOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixRQURRLEVBRVIsYUFGUSxDQVRLOztBQWNmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixJQURVLENBakJHO0lBcUJmLE9BQUEsRUFDRTtNQUFBLGVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsV0FBQSxFQUFhLGlDQUZiO09BREY7TUFJQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLE9BQUEsRUFBUyxDQUZUO1FBR0EsV0FBQSxFQUFhLHlCQUhiO09BTEY7TUFTQSxNQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sT0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQyxLQUFELENBRFQ7UUFFQSxLQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sUUFBTjtTQUhGO1FBSUEsV0FBQSxFQUFhLGtDQUpiO09BVkY7TUFlQSxTQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsVUFEVDtRQUVBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsTUFBYixDQUZOO1FBR0EsV0FBQSxFQUFhLGdDQUhiO09BaEJGO01Bb0JBLFlBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQURUO1FBRUEsV0FBQSxFQUFhLCtCQUZiO09BckJGO01Bd0JBLFlBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLHlDQUZiO09BekJGO01BNEJBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsc0JBRFQ7UUFFQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQ0osTUFESSxFQUVKLFVBRkksRUFHSixnQkFISSxFQUlKLHlCQUpJLEVBS0osY0FMSSxFQU1KLHNCQU5JLEVBT0osTUFQSSxDQUZOO1FBV0EsV0FBQSxFQUFhLDBEQVhiO09BN0JGO0tBdEJhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6IFwiUHl0aG9uXCJcbiAgbmFtZXNwYWNlOiBcInB5dGhvblwiXG4gIHNjb3BlOiBbJ3NvdXJjZS5weXRob24nXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJQeXRob25cIixcbiAgICBcIk1hZ2ljUHl0aG9uXCJcbiAgXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAjIyNcbiAgZXh0ZW5zaW9uczogW1xuICAgIFwicHlcIlxuICBdXG5cbiAgb3B0aW9uczpcbiAgICBtYXhfbGluZV9sZW5ndGg6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDc5XG4gICAgICBkZXNjcmlwdGlvbjogXCJzZXQgbWF4aW11bSBhbGxvd2VkIGxpbmUgbGVuZ3RoXCJcbiAgICBpbmRlbnRfc2l6ZTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgbWluaW11bTogMFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gc2l6ZS9sZW5ndGhcIlxuICAgIGlnbm9yZTpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFtcIkUyNFwiXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZXNjcmlwdGlvbjogXCJkbyBub3QgZml4IHRoZXNlIGVycm9ycy93YXJuaW5nc1wiXG4gICAgZm9ybWF0dGVyOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdhdXRvcGVwOCdcbiAgICAgIGVudW06IFsnYXV0b3BlcDgnLCAneWFwZiddXG4gICAgICBkZXNjcmlwdGlvbjogXCJmb3JtYXR0ZXIgdXNlZCBieSBweWJlYXV0aWZpZXJcIlxuICAgIHN0eWxlX2NvbmZpZzpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAncGVwOCdcbiAgICAgIGRlc2NyaXB0aW9uOiBcImZvcm1hdHRpbmcgc3R5bGUgdXNlZCBieSB5YXBmXCJcbiAgICBzb3J0X2ltcG9ydHM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJzb3J0IGltcG9ydHMgKHJlcXVpcmVzIGlzb3J0IGluc3RhbGxlZClcIlxuICAgIG11bHRpX2xpbmVfb3V0cHV0OlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdIYW5naW5nIEdyaWQgR3JvdXBlZCdcbiAgICAgIGVudW06IFtcbiAgICAgICAgJ0dyaWQnXG4gICAgICAgICdWZXJ0aWNhbCdcbiAgICAgICAgJ0hhbmdpbmcgSW5kZW50J1xuICAgICAgICAnVmVydGljYWwgSGFuZ2luZyBJbmRlbnQnXG4gICAgICAgICdIYW5naW5nIEdyaWQnXG4gICAgICAgICdIYW5naW5nIEdyaWQgR3JvdXBlZCdcbiAgICAgICAgJ05PUUEnXG4gICAgICBdXG4gICAgICBkZXNjcmlwdGlvbjogXCJkZWZpbmVzIGhvdyBmcm9tIGltcG9ydHMgd3JhcCAocmVxdWlyZXMgaXNvcnQgaW5zdGFsbGVkKVwiXG59XG4iXX0=
