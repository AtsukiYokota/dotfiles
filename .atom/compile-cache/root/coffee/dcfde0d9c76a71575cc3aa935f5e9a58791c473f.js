(function() {
  module.exports = {
    name: "HTML",
    namespace: "html",
    scope: ['text.html'],

    /*
    Supported Grammars
     */
    grammars: ["HTML"],

    /*
    Supported extensions
     */
    extensions: ["html"],
    options: {
      indent_inner_html: {
        type: 'boolean',
        "default": false,
        description: "Indent <head> and <body> sections."
      },
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
      brace_style: {
        type: 'string',
        "default": "collapse",
        "enum": ["collapse", "expand", "end-expand", "none"],
        description: "[collapse|expand|end-expand|none]"
      },
      indent_scripts: {
        type: 'string',
        "default": "normal",
        "enum": ["keep", "separate", "normal"],
        description: "[keep|separate|normal]"
      },
      wrap_line_length: {
        type: 'integer',
        "default": 250,
        description: "Maximum characters per line (0 disables)"
      },
      wrap_attributes: {
        type: 'string',
        "default": "auto",
        "enum": ["auto", "force", "force-aligned", "force-expand-multiline"],
        description: "Wrap attributes to new lines [auto|force|force-aligned|force-expand-multiline]"
      },
      wrap_attributes_indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indent wrapped attributes to after N characters"
      },
      preserve_newlines: {
        type: 'boolean',
        "default": true,
        description: "Preserve line-breaks"
      },
      max_preserve_newlines: {
        type: 'integer',
        "default": 10,
        description: "Number of line-breaks to be preserved in one chunk"
      },
      unformatted: {
        type: 'array',
        "default": ['a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript', 'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'var', 'video', 'wbr', 'text', 'acronym', 'address', 'big', 'dt', 'ins', 'small', 'strike', 'tt', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        items: {
          type: 'string'
        },
        description: "List of tags (defaults to inline) that should not be reformatted"
      },
      end_with_newline: {
        type: 'boolean',
        "default": false,
        description: "End output with newline"
      },
      extra_liners: {
        type: 'array',
        "default": ['head', 'body', '/html'],
        items: {
          type: 'string'
        },
        description: "List of tags (defaults to [head,body,/html] that should have an extra newline before them."
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9odG1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLE1BRlM7SUFHZixTQUFBLEVBQVcsTUFISTtJQUlmLEtBQUEsRUFBTyxDQUFDLFdBQUQsQ0FKUTs7QUFNZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsTUFEUSxDQVRLOztBQWFmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixNQURVLENBaEJHO0lBb0JmLE9BQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSxvQ0FGYjtPQURGO01BSUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxPQUFBLEVBQVMsQ0FGVDtRQUdBLFdBQUEsRUFBYSx5QkFIYjtPQUxGO01BU0EsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsdUJBRmI7T0FWRjtNQWFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxVQURUO1FBRUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLFVBQUQsRUFBYSxRQUFiLEVBQXVCLFlBQXZCLEVBQXFDLE1BQXJDLENBRk47UUFHQSxXQUFBLEVBQWEsbUNBSGI7T0FkRjtNQWtCQSxjQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsUUFEVDtRQUVBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVB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bnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogXCJIVE1MXCJcbiAgbmFtZXNwYWNlOiBcImh0bWxcIlxuICBzY29wZTogWyd0ZXh0Lmh0bWwnXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJIVE1MXCJcbiAgXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAjIyNcbiAgZXh0ZW5zaW9uczogW1xuICAgIFwiaHRtbFwiXG4gIF1cblxuICBvcHRpb25zOlxuICAgIGluZGVudF9pbm5lcl9odG1sOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50IDxoZWFkPiBhbmQgPGJvZHk+IHNlY3Rpb25zLlwiXG4gICAgaW5kZW50X3NpemU6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcbiAgICBpbmRlbnRfY2hhcjpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBjaGFyYWN0ZXJcIlxuICAgIGJyYWNlX3N0eWxlOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiY29sbGFwc2VcIlxuICAgICAgZW51bTogW1wiY29sbGFwc2VcIiwgXCJleHBhbmRcIiwgXCJlbmQtZXhwYW5kXCIsIFwibm9uZVwiXVxuICAgICAgZGVzY3JpcHRpb246IFwiW2NvbGxhcHNlfGV4cGFuZHxlbmQtZXhwYW5kfG5vbmVdXCJcbiAgICBpbmRlbnRfc2NyaXB0czpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIm5vcm1hbFwiXG4gICAgICBlbnVtOiBbXCJrZWVwXCIsIFwic2VwYXJhdGVcIiwgXCJub3JtYWxcIl1cbiAgICAgIGRlc2NyaXB0aW9uOiBcIltrZWVwfHNlcGFyYXRlfG5vcm1hbF1cIlxuICAgIHdyYXBfbGluZV9sZW5ndGg6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDI1MFxuICAgICAgZGVzY3JpcHRpb246IFwiTWF4aW11bSBjaGFyYWN0ZXJzIHBlciBsaW5lICgwIGRpc2FibGVzKVwiXG4gICAgd3JhcF9hdHRyaWJ1dGVzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiYXV0b1wiXG4gICAgICBlbnVtOiBbXCJhdXRvXCIsIFwiZm9yY2VcIiwgXCJmb3JjZS1hbGlnbmVkXCIsIFwiZm9yY2UtZXhwYW5kLW11bHRpbGluZVwiXVxuICAgICAgZGVzY3JpcHRpb246IFwiV3JhcCBhdHRyaWJ1dGVzIHRvIG5ldyBsaW5lcyBbYXV0b3xmb3JjZXxmb3JjZS1hbGlnbmVkfGZvcmNlLWV4cGFuZC1tdWx0aWxpbmVdXCJcbiAgICB3cmFwX2F0dHJpYnV0ZXNfaW5kZW50X3NpemU6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudCB3cmFwcGVkIGF0dHJpYnV0ZXMgdG8gYWZ0ZXIgTiBjaGFyYWN0ZXJzXCJcbiAgICBwcmVzZXJ2ZV9uZXdsaW5lczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiUHJlc2VydmUgbGluZS1icmVha3NcIlxuICAgIG1heF9wcmVzZXJ2ZV9uZXdsaW5lczpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogMTBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIk51bWJlciBvZiBsaW5lLWJyZWFrcyB0byBiZSBwcmVzZXJ2ZWQgaW4gb25lIGNodW5rXCJcbiAgICB1bmZvcm1hdHRlZDpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFtcbiAgICAgICAgICAgICdhJywgJ2FiYnInLCAnYXJlYScsICdhdWRpbycsICdiJywgJ2JkaScsICdiZG8nLCAnYnInLCAnYnV0dG9uJywgJ2NhbnZhcycsICdjaXRlJyxcbiAgICAgICAgICAgICdjb2RlJywgJ2RhdGEnLCAnZGF0YWxpc3QnLCAnZGVsJywgJ2RmbicsICdlbScsICdlbWJlZCcsICdpJywgJ2lmcmFtZScsICdpbWcnLFxuICAgICAgICAgICAgJ2lucHV0JywgJ2lucycsICdrYmQnLCAna2V5Z2VuJywgJ2xhYmVsJywgJ21hcCcsICdtYXJrJywgJ21hdGgnLCAnbWV0ZXInLCAnbm9zY3JpcHQnLFxuICAgICAgICAgICAgJ29iamVjdCcsICdvdXRwdXQnLCAncHJvZ3Jlc3MnLCAncScsICdydWJ5JywgJ3MnLCAnc2FtcCcsICdzZWxlY3QnLCAnc21hbGwnLFxuICAgICAgICAgICAgJ3NwYW4nLCAnc3Ryb25nJywgJ3N1YicsICdzdXAnLCAnc3ZnJywgJ3RlbXBsYXRlJywgJ3RleHRhcmVhJywgJ3RpbWUnLCAndScsICd2YXInLFxuICAgICAgICAgICAgJ3ZpZGVvJywgJ3dicicsICd0ZXh0JyxcbiAgICAgICAgICAgICdhY3JvbnltJywgJ2FkZHJlc3MnLCAnYmlnJywgJ2R0JywgJ2lucycsICdzbWFsbCcsICdzdHJpa2UnLCAndHQnLFxuICAgICAgICAgICAgJ3ByZScsXG4gICAgICAgICAgICAnaDEnLCAnaDInLCAnaDMnLCAnaDQnLCAnaDUnLCAnaDYnXG4gICAgICAgIF1cbiAgICAgIGl0ZW1zOlxuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVzY3JpcHRpb246IFwiTGlzdCBvZiB0YWdzIChkZWZhdWx0cyB0byBpbmxpbmUpIHRoYXQgc2hvdWxkIG5vdCBiZSByZWZvcm1hdHRlZFwiXG4gICAgZW5kX3dpdGhfbmV3bGluZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVuZCBvdXRwdXQgd2l0aCBuZXdsaW5lXCJcbiAgICBleHRyYV9saW5lcnM6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbJ2hlYWQnLCAnYm9keScsICcvaHRtbCddXG4gICAgICBpdGVtczpcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkxpc3Qgb2YgdGFncyAoZGVmYXVsdHMgdG8gW2hlYWQsYm9keSwvaHRtbF0gdGhhdCBzaG91bGQgaGF2ZSBhbiBleHRyYSBuZXdsaW5lIGJlZm9yZSB0aGVtLlwiXG5cbn1cbiJdfQ==
