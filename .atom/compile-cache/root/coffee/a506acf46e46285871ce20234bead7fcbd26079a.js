(function() {
  module.exports = {
    name: "Markdown",
    namespace: "markdown",

    /*
    Supported Grammars
     */
    grammars: ["GitHub Markdown"],

    /*
    Supported extensions
     */
    extensions: ["markdown", "md"],
    defaultBeautifier: "Remark",
    options: {
      gfm: {
        type: 'boolean',
        "default": true,
        description: 'GitHub Flavoured Markdown'
      },
      yaml: {
        type: 'boolean',
        "default": true,
        description: 'Enables raw YAML front matter to be detected (thus ignoring markdown-like syntax).'
      },
      commonmark: {
        type: 'boolean',
        "default": false,
        description: 'Allows and disallows several constructs.'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9tYXJrZG93bi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxVQUZTO0lBR2YsU0FBQSxFQUFXLFVBSEk7O0FBS2Y7OztJQUdBLFFBQUEsRUFBVSxDQUNSLGlCQURRLENBUks7O0FBWWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLFVBRFUsRUFFVixJQUZVLENBZkc7SUFvQmYsaUJBQUEsRUFBbUIsUUFwQko7SUFzQmYsT0FBQSxFQUNFO01BQUEsR0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsMkJBRmI7T0FERjtNQUlBLElBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLG9GQUZiO09BTEY7TUFRQSxVQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSwwQ0FGYjtPQVRGO0tBdkJhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6IFwiTWFya2Rvd25cIlxuICBuYW1lc3BhY2U6IFwibWFya2Rvd25cIlxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJHaXRIdWIgTWFya2Rvd25cIlxuICBdXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgXCJtYXJrZG93blwiXG4gICAgXCJtZFwiXG4gIF1cblxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJSZW1hcmtcIlxuXG4gIG9wdGlvbnM6XG4gICAgZ2ZtOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogJ0dpdEh1YiBGbGF2b3VyZWQgTWFya2Rvd24nXG4gICAgeWFtbDpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246ICdFbmFibGVzIHJhdyBZQU1MIGZyb250IG1hdHRlciB0byBiZSBkZXRlY3RlZCAodGh1cyBpZ25vcmluZyBtYXJrZG93bi1saWtlIHN5bnRheCkuJ1xuICAgIGNvbW1vbm1hcms6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogJ0FsbG93cyBhbmQgZGlzYWxsb3dzIHNldmVyYWwgY29uc3RydWN0cy4nXG59XG4iXX0=
