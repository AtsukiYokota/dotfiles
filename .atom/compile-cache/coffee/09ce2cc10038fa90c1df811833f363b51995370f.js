(function() {
  module.exports = {
    name: "PHP",
    namespace: "php",

    /*
    Supported Grammars
     */
    grammars: ["PHP"],

    /*
    Supported extensions
     */
    extensions: ["php", "module", "inc"],
    defaultBeautifier: "PHP-CS-Fixer",
    options: {
      cs_fixer_path: {
        title: "PHP-CS-Fixer Path",
        type: 'string',
        "default": "",
        description: "Absolute path to the `php-cs-fixer` CLI executable"
      },
      cs_fixer_version: {
        title: "PHP-CS-Fixer Version",
        type: 'integer',
        "default": 2,
        "enum": [1, 2]
      },
      cs_fixer_config_file: {
        title: "PHP-CS-Fixer Config File",
        type: 'string',
        "default": "",
        description: "Path to php-cs-fixer config file. Will use local `.php_cs` or `.php_cs.dist` if found in the working directory or project root."
      },
      fixers: {
        type: 'string',
        "default": "",
        description: "Add fixer(s). i.e. linefeed,-short_tag,indentation (PHP-CS-Fixer 1 only)"
      },
      level: {
        type: 'string',
        "default": "",
        description: "By default, all PSR-2 fixers and some additional ones are run. (PHP-CS-Fixer 1 only)"
      },
      rules: {
        type: 'string',
        "default": "",
        description: "Add rule(s). i.e. line_ending,-full_opening_tag,@PSR2 (PHP-CS-Fixer 2 only)"
      },
      allow_risky: {
        title: "Allow risky rules",
        type: 'string',
        "default": "no",
        "enum": ["no", "yes"],
        description: "Allow risky rules to be applied (PHP-CS-Fixer 2 only)"
      },
      phpcbf_path: {
        title: "PHPCBF Path",
        type: 'string',
        "default": "",
        description: "Path to the `phpcbf` CLI executable"
      },
      phpcbf_version: {
        title: "PHPCBF Version",
        type: 'integer',
        "default": 2,
        "enum": [1, 2, 3]
      },
      standard: {
        title: "PHPCBF Standard",
        type: 'string',
        "default": "PEAR",
        description: "Standard name Squiz, PSR2, PSR1, PHPCS, PEAR, Zend, MySource... or path to CS rules. Will use local `phpcs.xml`, `phpcs.xml.dist`, `phpcs.ruleset.xml` or `ruleset.xml` if found in the project root."
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9waHAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sS0FGUztJQUdmLFNBQUEsRUFBVyxLQUhJOztBQUtmOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixLQURRLENBUks7O0FBWWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLEtBRFUsRUFFVixRQUZVLEVBR1YsS0FIVSxDQWZHO0lBcUJmLGlCQUFBLEVBQW1CLGNBckJKO0lBdUJmLE9BQUEsRUFDRTtNQUFBLGFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxtQkFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO1FBR0EsV0FBQSxFQUFhLG9EQUhiO09BREY7TUFLQSxnQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHNCQUFQO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBRlQ7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FITjtPQU5GO01BVUEsb0JBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTywwQkFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO1FBR0EsV0FBQSxFQUFhLGlJQUhiO09BWEY7TUFlQSxNQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSwwRUFGYjtPQWhCRjtNQW1CQSxLQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSxzRkFGYjtPQXBCRjtNQXVCQSxLQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSw2RUFGYjtPQXhCRjtNQTJCQSxXQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sbUJBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxJQUFELEVBQU8sS0FBUCxDQUhOO1FBSUEsV0FBQSxFQUFhLHVEQUpiO09BNUJGO01BaUNBLFdBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxhQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRlQ7UUFHQSxXQUFBLEVBQWEscUNBSGI7T0FsQ0Y7TUFzQ0EsY0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGdCQUFQO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBRlQ7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBSE47T0F2Q0Y7TUEyQ0EsUUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGlCQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BRlQ7UUFHQSxXQUFBLEVBQWEsdU1BSGI7T0E1Q0Y7S0F4QmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogXCJQSFBcIlxuICBuYW1lc3BhY2U6IFwicGhwXCJcblxuICAjIyNcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXG4gICMjI1xuICBncmFtbWFyczogW1xuICAgIFwiUEhQXCJcbiAgXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAjIyNcbiAgZXh0ZW5zaW9uczogW1xuICAgIFwicGhwXCJcbiAgICBcIm1vZHVsZVwiXG4gICAgXCJpbmNcIlxuICBdXG5cbiAgZGVmYXVsdEJlYXV0aWZpZXI6IFwiUEhQLUNTLUZpeGVyXCJcblxuICBvcHRpb25zOlxuICAgIGNzX2ZpeGVyX3BhdGg6XG4gICAgICB0aXRsZTogXCJQSFAtQ1MtRml4ZXIgUGF0aFwiXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiQWJzb2x1dGUgcGF0aCB0byB0aGUgYHBocC1jcy1maXhlcmAgQ0xJIGV4ZWN1dGFibGVcIlxuICAgIGNzX2ZpeGVyX3ZlcnNpb246XG4gICAgICB0aXRsZTogXCJQSFAtQ1MtRml4ZXIgVmVyc2lvblwiXG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDJcbiAgICAgIGVudW06IFsxLCAyXVxuICAgIGNzX2ZpeGVyX2NvbmZpZ19maWxlOlxuICAgICAgdGl0bGU6IFwiUEhQLUNTLUZpeGVyIENvbmZpZyBGaWxlXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJQYXRoIHRvIHBocC1jcy1maXhlciBjb25maWcgZmlsZS4gV2lsbCB1c2UgbG9jYWwgYC5waHBfY3NgIG9yIGAucGhwX2NzLmRpc3RgIGlmIGZvdW5kIGluIHRoZSB3b3JraW5nIGRpcmVjdG9yeSBvciBwcm9qZWN0IHJvb3QuXCJcbiAgICBmaXhlcnM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiQWRkIGZpeGVyKHMpLiBpLmUuIGxpbmVmZWVkLC1zaG9ydF90YWcsaW5kZW50YXRpb24gKFBIUC1DUy1GaXhlciAxIG9ubHkpXCJcbiAgICBsZXZlbDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJCeSBkZWZhdWx0LCBhbGwgUFNSLTIgZml4ZXJzIGFuZCBzb21lIGFkZGl0aW9uYWwgb25lcyBhcmUgcnVuLiAoUEhQLUNTLUZpeGVyIDEgb25seSlcIlxuICAgIHJ1bGVzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFkZCBydWxlKHMpLiBpLmUuIGxpbmVfZW5kaW5nLC1mdWxsX29wZW5pbmdfdGFnLEBQU1IyIChQSFAtQ1MtRml4ZXIgMiBvbmx5KVwiXG4gICAgYWxsb3dfcmlza3k6XG4gICAgICB0aXRsZTogXCJBbGxvdyByaXNreSBydWxlc1wiXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJub1wiXG4gICAgICBlbnVtOiBbXCJub1wiLCBcInllc1wiXVxuICAgICAgZGVzY3JpcHRpb246IFwiQWxsb3cgcmlza3kgcnVsZXMgdG8gYmUgYXBwbGllZCAoUEhQLUNTLUZpeGVyIDIgb25seSlcIlxuICAgIHBocGNiZl9wYXRoOlxuICAgICAgdGl0bGU6IFwiUEhQQ0JGIFBhdGhcIlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlBhdGggdG8gdGhlIGBwaHBjYmZgIENMSSBleGVjdXRhYmxlXCIsXG4gICAgcGhwY2JmX3ZlcnNpb246XG4gICAgICB0aXRsZTogXCJQSFBDQkYgVmVyc2lvblwiXG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDJcbiAgICAgIGVudW06IFsxLCAyLCAzXVxuICAgIHN0YW5kYXJkOlxuICAgICAgdGl0bGU6IFwiUEhQQ0JGIFN0YW5kYXJkXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlBFQVJcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlN0YW5kYXJkIG5hbWUgU3F1aXosIFBTUjIsIFBTUjEsIFBIUENTLCBQRUFSLCBaZW5kLCBNeVNvdXJjZS4uLiBvciBwYXRoIHRvIENTIHJ1bGVzLiBXaWxsIHVzZSBsb2NhbCBgcGhwY3MueG1sYCwgYHBocGNzLnhtbC5kaXN0YCwgYHBocGNzLnJ1bGVzZXQueG1sYCBvciBgcnVsZXNldC54bWxgIGlmIGZvdW5kIGluIHRoZSBwcm9qZWN0IHJvb3QuXCJcblxufVxuIl19
