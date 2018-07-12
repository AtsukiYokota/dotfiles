(function() {
  module.exports = {
    name: "SQL",
    namespace: "sql",
    scope: ['source.sql'],

    /*
    Supported Grammars
     */
    grammars: ["SQL (Rails)", "SQL"],

    /*
    Supported extensions
     */
    extensions: ["sql"],
    options: {
      indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indentation size/length"
      },
      reindent: {
        type: 'boolean',
        "default": true,
        description: "Change indentations of the statements. Uncheck this option to preserve indentation"
      },
      keywords: {
        type: 'string',
        "default": "upper",
        description: "Change case of keywords",
        "enum": ["unchanged", "lower", "upper", "capitalize"]
      },
      identifiers: {
        type: 'string',
        "default": "unchanged",
        description: "Change case of identifiers",
        "enum": ["unchanged", "lower", "upper", "capitalize"]
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9zcWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sS0FGUztJQUdmLFNBQUEsRUFBVyxLQUhJO0lBSWYsS0FBQSxFQUFPLENBQUMsWUFBRCxDQUpROztBQU1mOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixhQURRLEVBRVIsS0FGUSxDQVRLOztBQWNmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixLQURVLENBakJHO0lBcUJmLE9BQUEsRUFFRTtNQUFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEseUJBSGI7T0FERjtNQUtBLFFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLG9GQUZiO09BTkY7TUFTQSxRQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FEVDtRQUVBLFdBQUEsRUFBYSx5QkFGYjtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxXQUFELEVBQWEsT0FBYixFQUFxQixPQUFyQixFQUE2QixZQUE3QixDQUhOO09BVkY7TUFjQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsV0FEVDtRQUVBLFdBQUEsRUFBYSw0QkFGYjtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxXQUFELEVBQWEsT0FBYixFQUFxQixPQUFyQixFQUE2QixZQUE3QixDQUhOO09BZkY7S0F2QmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogXCJTUUxcIlxuICBuYW1lc3BhY2U6IFwic3FsXCJcbiAgc2NvcGU6IFsnc291cmNlLnNxbCddXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xuICAjIyNcbiAgZ3JhbW1hcnM6IFtcbiAgICBcIlNRTCAoUmFpbHMpXCJcbiAgICBcIlNRTFwiXG4gIF1cblxuICAjIyNcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcbiAgIyMjXG4gIGV4dGVuc2lvbnM6IFtcbiAgICBcInNxbFwiXG4gIF1cblxuICBvcHRpb25zOlxuICAgICMgU1FMXG4gICAgaW5kZW50X3NpemU6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcbiAgICByZWluZGVudDpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiQ2hhbmdlIGluZGVudGF0aW9ucyBvZiB0aGUgc3RhdGVtZW50cy4gVW5jaGVjayB0aGlzIG9wdGlvbiB0byBwcmVzZXJ2ZSBpbmRlbnRhdGlvblwiXG4gICAga2V5d29yZHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJ1cHBlclwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJDaGFuZ2UgY2FzZSBvZiBrZXl3b3Jkc1wiXG4gICAgICBlbnVtOiBbXCJ1bmNoYW5nZWRcIixcImxvd2VyXCIsXCJ1cHBlclwiLFwiY2FwaXRhbGl6ZVwiXVxuICAgIGlkZW50aWZpZXJzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwidW5jaGFuZ2VkXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBjYXNlIG9mIGlkZW50aWZpZXJzXCJcbiAgICAgIGVudW06IFtcInVuY2hhbmdlZFwiLFwibG93ZXJcIixcInVwcGVyXCIsXCJjYXBpdGFsaXplXCJdXG5cbn1cbiJdfQ==
