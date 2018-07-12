(function() {
  module.exports = {
    name: "CSS",
    namespace: "css",
    scope: ['source.css'],

    /*
    Supported Grammars
     */
    grammars: ["CSS"],

    /*
    Supported extensions
     */
    extensions: ["css"],
    defaultBeautifier: "JS Beautify",
    options: {
      indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indentation size/length"
      },
      indent_char: {
        type: 'string',
        "default": null,
        minimum: 0,
        description: "Indentation character"
      },
      selector_separator_newline: {
        type: 'boolean',
        "default": false,
        description: "Add a newline between multiple selectors"
      },
      newline_between_rules: {
        type: 'boolean',
        "default": true,
        description: "Add a newline between CSS rules"
      },
      preserve_newlines: {
        type: 'boolean',
        "default": false,
        description: "Retain empty lines. " + "Consecutive empty lines will be converted to a single empty line."
      },
      wrap_line_length: {
        type: 'integer',
        "default": 0,
        description: "Maximum amount of characters per line (0 = disable)"
      },
      end_with_newline: {
        type: 'boolean',
        "default": false,
        description: "End output with newline"
      },
      indent_comments: {
        type: 'boolean',
        "default": true,
        description: "Determines whether comments should be indented."
      },
      force_indentation: {
        type: 'boolean',
        "default": false,
        description: "if indentation should be forcefully applied to markup even if it disruptively adds unintended whitespace to the documents rendered output"
      },
      convert_quotes: {
        type: 'string',
        "default": "none",
        description: "Convert the quote characters delimiting strings from either double or single quotes to the other.",
        "enum": ["none", "double", "single"]
      },
      align_assignments: {
        type: 'boolean',
        "default": false,
        description: "If lists of assignments or properties should be vertically aligned for faster and easier reading."
      },
      no_lead_zero: {
        type: 'boolean',
        "default": false,
        description: "If in CSS values leading 0s immediately preceding a decimal should be removed or prevented."
      },
      configPath: {
        title: "comb custom config file",
        type: 'string',
        "default": "",
        description: "Path to custom CSScomb config file, used in absence of a `.csscomb.json` or `.csscomb.cson` at the root of your project."
      },
      predefinedConfig: {
        title: "comb predefined config",
        type: 'string',
        "default": "csscomb",
        description: "Used if neither a project or custom config file exists.",
        "enum": ["csscomb", "yandex", "zen"]
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9jc3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sS0FGUztJQUdmLFNBQUEsRUFBVyxLQUhJO0lBSWYsS0FBQSxFQUFPLENBQUMsWUFBRCxDQUpROztBQU1mOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixLQURRLENBVEs7O0FBYWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLEtBRFUsQ0FoQkc7SUFvQmYsaUJBQUEsRUFBbUIsYUFwQko7SUFzQmYsT0FBQSxFQUVFO01BQUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxPQUFBLEVBQVMsQ0FGVDtRQUdBLFdBQUEsRUFBYSx5QkFIYjtPQURGO01BS0EsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxPQUFBLEVBQVMsQ0FGVDtRQUdBLFdBQUEsRUFBYSx1QkFIYjtPQU5GO01BVUEsMEJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLDBDQUZiO09BWEY7TUFjQSxxQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsaUNBRmI7T0FmRjtNQWtCQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsc0JBQUEsR0FDWCxtRUFIRjtPQW5CRjtNQXdCQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBRFQ7UUFFQSxXQUFBLEVBQWEscURBRmI7T0F6QkY7TUE0QkEsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLHlCQUZiO09BN0JGO01BZ0NBLGVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLGlEQUZiO09BakNGO01Bb0NBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSwySUFGYjtPQXJDRjtNQTBDQSxjQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFEVDtRQUVBLFdBQUEsRUFBYSxtR0FGYjtRQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixRQUFuQixDQUpOO09BM0NGO01BZ0RBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSxtR0FGYjtPQWpERjtNQXFEQSxZQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSw2RkFGYjtPQXRERjtNQTBEQSxVQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8seUJBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtRQUdBLFdBQUEsRUFBYSwwSEFIYjtPQTNERjtNQWdFQSxnQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHdCQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRlQ7UUFHQSxXQUFBLEVBQWEseURBSGI7UUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsU0FBRCxFQUFZLFFBQVosRUFBc0IsS0FBdEIsQ0FKTjtPQWpFRjtLQXhCYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIkNTU1wiXG4gIG5hbWVzcGFjZTogXCJjc3NcIlxuICBzY29wZTogWydzb3VyY2UuY3NzJ11cblxuICAjIyNcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXG4gICMjI1xuICBncmFtbWFyczogW1xuICAgIFwiQ1NTXCJcbiAgXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAjIyNcbiAgZXh0ZW5zaW9uczogW1xuICAgIFwiY3NzXCJcbiAgXVxuXG4gIGRlZmF1bHRCZWF1dGlmaWVyOiBcIkpTIEJlYXV0aWZ5XCJcblxuICBvcHRpb25zOlxuICAgICMgQ1NTXG4gICAgaW5kZW50X3NpemU6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcbiAgICBpbmRlbnRfY2hhcjpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBjaGFyYWN0ZXJcIlxuICAgIHNlbGVjdG9yX3NlcGFyYXRvcl9uZXdsaW5lOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiQWRkIGEgbmV3bGluZSBiZXR3ZWVuIG11bHRpcGxlIHNlbGVjdG9yc1wiXG4gICAgbmV3bGluZV9iZXR3ZWVuX3J1bGVzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJBZGQgYSBuZXdsaW5lIGJldHdlZW4gQ1NTIHJ1bGVzXCJcbiAgICBwcmVzZXJ2ZV9uZXdsaW5lczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlJldGFpbiBlbXB0eSBsaW5lcy4gXCIrXG4gICAgICAgIFwiQ29uc2VjdXRpdmUgZW1wdHkgbGluZXMgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gXFxcbiAgICAgICAgICAgICAgICBhIHNpbmdsZSBlbXB0eSBsaW5lLlwiXG4gICAgd3JhcF9saW5lX2xlbmd0aDpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogMFxuICAgICAgZGVzY3JpcHRpb246IFwiTWF4aW11bSBhbW91bnQgb2YgY2hhcmFjdGVycyBwZXIgbGluZSAoMCA9IGRpc2FibGUpXCJcbiAgICBlbmRfd2l0aF9uZXdsaW5lOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiRW5kIG91dHB1dCB3aXRoIG5ld2xpbmVcIlxuICAgIGluZGVudF9jb21tZW50czpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiRGV0ZXJtaW5lcyB3aGV0aGVyIGNvbW1lbnRzIHNob3VsZCBiZSBpbmRlbnRlZC5cIlxuICAgIGZvcmNlX2luZGVudGF0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiaWYgaW5kZW50YXRpb24gc2hvdWxkIGJlIGZvcmNlZnVsbHkgYXBwbGllZCB0byBcXFxuICAgICAgICAgICAgICAgIG1hcmt1cCBldmVuIGlmIGl0IGRpc3J1cHRpdmVseSBhZGRzIHVuaW50ZW5kZWQgd2hpdGVzcGFjZSBcXFxuICAgICAgICAgICAgICAgIHRvIHRoZSBkb2N1bWVudHMgcmVuZGVyZWQgb3V0cHV0XCJcbiAgICBjb252ZXJ0X3F1b3RlczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIm5vbmVcIlxuICAgICAgZGVzY3JpcHRpb246IFwiQ29udmVydCB0aGUgcXVvdGUgY2hhcmFjdGVycyBkZWxpbWl0aW5nIHN0cmluZ3MgXFxcbiAgICAgICAgICAgICAgICBmcm9tIGVpdGhlciBkb3VibGUgb3Igc2luZ2xlIHF1b3RlcyB0byB0aGUgb3RoZXIuXCJcbiAgICAgIGVudW06IFtcIm5vbmVcIiwgXCJkb3VibGVcIiwgXCJzaW5nbGVcIl1cbiAgICBhbGlnbl9hc3NpZ25tZW50czpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIklmIGxpc3RzIG9mIGFzc2lnbm1lbnRzIG9yIHByb3BlcnRpZXMgc2hvdWxkIGJlIFxcXG4gICAgICAgICAgICAgICAgdmVydGljYWxseSBhbGlnbmVkIGZvciBmYXN0ZXIgYW5kIGVhc2llciByZWFkaW5nLlwiXG4gICAgbm9fbGVhZF96ZXJvOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiSWYgaW4gQ1NTIHZhbHVlcyBsZWFkaW5nIDBzIGltbWVkaWF0ZWx5IHByZWNlZGluZyBcXFxuICAgICAgICAgICAgICAgIGEgZGVjaW1hbCBzaG91bGQgYmUgcmVtb3ZlZCBvciBwcmV2ZW50ZWQuXCJcbiAgICBjb25maWdQYXRoOlxuICAgICAgdGl0bGU6IFwiY29tYiBjdXN0b20gY29uZmlnIGZpbGVcIlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlBhdGggdG8gY3VzdG9tIENTU2NvbWIgY29uZmlnIGZpbGUsIHVzZWQgaW4gYWJzZW5jZSBvZiBhIFxcXG4gICAgICAgICAgICAgICAgYC5jc3Njb21iLmpzb25gIG9yIGAuY3NzY29tYi5jc29uYCBhdCB0aGUgcm9vdCBvZiB5b3VyIHByb2plY3QuXCJcbiAgICBwcmVkZWZpbmVkQ29uZmlnOlxuICAgICAgdGl0bGU6IFwiY29tYiBwcmVkZWZpbmVkIGNvbmZpZ1wiXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJjc3Njb21iXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVzZWQgaWYgbmVpdGhlciBhIHByb2plY3Qgb3IgY3VzdG9tIGNvbmZpZyBmaWxlIGV4aXN0cy5cIlxuICAgICAgZW51bTogW1wiY3NzY29tYlwiLCBcInlhbmRleFwiLCBcInplblwiXVxufVxuIl19
