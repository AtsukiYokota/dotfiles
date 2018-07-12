(function() {
  module.exports = {
    general: {
      title: 'General',
      type: 'object',
      collapsed: true,
      order: -2,
      description: 'General options for Atom Beautify',
      properties: {
        _analyticsUserId: {
          title: 'Analytics User Id',
          type: 'string',
          "default": "",
          description: "Unique identifier for this user for tracking usage analytics"
        },
        loggerLevel: {
          title: "Logger Level",
          type: 'string',
          "default": 'warn',
          description: 'Set the level for the logger',
          "enum": ['verbose', 'debug', 'info', 'warn', 'error']
        },
        beautifyEntireFileOnSave: {
          title: "Beautify Entire File On Save",
          type: 'boolean',
          "default": true,
          description: "When beautifying on save, use the entire file, even if there is selected text in the editor. Important: The `beautify on save` option for the specific language must be enabled for this to be applicable. This option is not `beautify on save`."
        },
        muteUnsupportedLanguageErrors: {
          title: "Mute Unsupported Language Errors",
          type: 'boolean',
          "default": false,
          description: "Do not show \"Unsupported Language\" errors when they occur"
        },
        muteAllErrors: {
          title: "Mute All Errors",
          type: 'boolean',
          "default": false,
          description: "Do not show any/all errors when they occur"
        },
        showLoadingView: {
          title: "Show Loading View",
          type: 'boolean',
          "default": true,
          description: "Show loading view when beautifying"
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2NvbmZpZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLE9BQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxTQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxTQUFBLEVBQVcsSUFGWDtNQUdBLEtBQUEsRUFBTyxDQUFDLENBSFI7TUFJQSxXQUFBLEVBQWEsbUNBSmI7TUFLQSxVQUFBLEVBQ0U7UUFBQSxnQkFBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLG1CQUFQO1VBQ0EsSUFBQSxFQUFPLFFBRFA7VUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFVLEVBRlY7VUFHQSxXQUFBLEVBQWMsOERBSGQ7U0FERjtRQUtBLFdBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxjQUFQO1VBQ0EsSUFBQSxFQUFPLFFBRFA7VUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFVLE1BRlY7VUFHQSxXQUFBLEVBQWMsOEJBSGQ7VUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFPLENBQUMsU0FBRCxFQUFZLE9BQVosRUFBcUIsTUFBckIsRUFBNkIsTUFBN0IsRUFBcUMsT0FBckMsQ0FKUDtTQU5GO1FBV0Esd0JBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyw4QkFBUDtVQUNBLElBQUEsRUFBTyxTQURQO1VBRUEsQ0FBQSxPQUFBLENBQUEsRUFBVSxJQUZWO1VBR0EsV0FBQSxFQUFjLG1QQUhkO1NBWkY7UUFnQkEsNkJBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxrQ0FBUDtVQUNBLElBQUEsRUFBTyxTQURQO1VBRUEsQ0FBQSxPQUFBLENBQUEsRUFBVSxLQUZWO1VBR0EsV0FBQSxFQUFjLDZEQUhkO1NBakJGO1FBcUJBLGFBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxpQkFBUDtVQUNBLElBQUEsRUFBTyxTQURQO1VBRUEsQ0FBQSxPQUFBLENBQUEsRUFBVSxLQUZWO1VBR0EsV0FBQSxFQUFjLDRDQUhkO1NBdEJGO1FBMEJBLGVBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxtQkFBUDtVQUNBLElBQUEsRUFBTyxTQURQO1VBRUEsQ0FBQSxPQUFBLENBQUEsRUFBVSxJQUZWO1VBR0EsV0FBQSxFQUFjLG9DQUhkO1NBM0JGO09BTkY7S0FGYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2VuZXJhbDpcbiAgICB0aXRsZTogJ0dlbmVyYWwnXG4gICAgdHlwZTogJ29iamVjdCdcbiAgICBjb2xsYXBzZWQ6IHRydWVcbiAgICBvcmRlcjogLTJcbiAgICBkZXNjcmlwdGlvbjogJ0dlbmVyYWwgb3B0aW9ucyBmb3IgQXRvbSBCZWF1dGlmeSdcbiAgICBwcm9wZXJ0aWVzOlxuICAgICAgX2FuYWx5dGljc1VzZXJJZCA6XG4gICAgICAgIHRpdGxlOiAnQW5hbHl0aWNzIFVzZXIgSWQnXG4gICAgICAgIHR5cGUgOiAnc3RyaW5nJ1xuICAgICAgICBkZWZhdWx0IDogXCJcIlxuICAgICAgICBkZXNjcmlwdGlvbiA6IFwiVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoaXMgdXNlciBmb3IgdHJhY2tpbmcgdXNhZ2UgYW5hbHl0aWNzXCJcbiAgICAgIGxvZ2dlckxldmVsIDpcbiAgICAgICAgdGl0bGU6IFwiTG9nZ2VyIExldmVsXCJcbiAgICAgICAgdHlwZSA6ICdzdHJpbmcnXG4gICAgICAgIGRlZmF1bHQgOiAnd2FybidcbiAgICAgICAgZGVzY3JpcHRpb24gOiAnU2V0IHRoZSBsZXZlbCBmb3IgdGhlIGxvZ2dlcidcbiAgICAgICAgZW51bSA6IFsndmVyYm9zZScsICdkZWJ1ZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXVxuICAgICAgYmVhdXRpZnlFbnRpcmVGaWxlT25TYXZlIDpcbiAgICAgICAgdGl0bGU6IFwiQmVhdXRpZnkgRW50aXJlIEZpbGUgT24gU2F2ZVwiXG4gICAgICAgIHR5cGUgOiAnYm9vbGVhbidcbiAgICAgICAgZGVmYXVsdCA6IHRydWVcbiAgICAgICAgZGVzY3JpcHRpb24gOiBcIldoZW4gYmVhdXRpZnlpbmcgb24gc2F2ZSwgdXNlIHRoZSBlbnRpcmUgZmlsZSwgZXZlbiBpZiB0aGVyZSBpcyBzZWxlY3RlZCB0ZXh0IGluIHRoZSBlZGl0b3IuIEltcG9ydGFudDogVGhlIGBiZWF1dGlmeSBvbiBzYXZlYCBvcHRpb24gZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBtdXN0IGJlIGVuYWJsZWQgZm9yIHRoaXMgdG8gYmUgYXBwbGljYWJsZS4gVGhpcyBvcHRpb24gaXMgbm90IGBiZWF1dGlmeSBvbiBzYXZlYC5cIlxuICAgICAgbXV0ZVVuc3VwcG9ydGVkTGFuZ3VhZ2VFcnJvcnMgOlxuICAgICAgICB0aXRsZTogXCJNdXRlIFVuc3VwcG9ydGVkIExhbmd1YWdlIEVycm9yc1wiXG4gICAgICAgIHR5cGUgOiAnYm9vbGVhbidcbiAgICAgICAgZGVmYXVsdCA6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uIDogXCJEbyBub3Qgc2hvdyBcXFwiVW5zdXBwb3J0ZWQgTGFuZ3VhZ2VcXFwiIGVycm9ycyB3aGVuIHRoZXkgb2NjdXJcIlxuICAgICAgbXV0ZUFsbEVycm9ycyA6XG4gICAgICAgIHRpdGxlOiBcIk11dGUgQWxsIEVycm9yc1wiXG4gICAgICAgIHR5cGUgOiAnYm9vbGVhbidcbiAgICAgICAgZGVmYXVsdCA6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uIDogXCJEbyBub3Qgc2hvdyBhbnkvYWxsIGVycm9ycyB3aGVuIHRoZXkgb2NjdXJcIlxuICAgICAgc2hvd0xvYWRpbmdWaWV3IDpcbiAgICAgICAgdGl0bGU6IFwiU2hvdyBMb2FkaW5nIFZpZXdcIlxuICAgICAgICB0eXBlIDogJ2Jvb2xlYW4nXG4gICAgICAgIGRlZmF1bHQgOiB0cnVlXG4gICAgICAgIGRlc2NyaXB0aW9uIDogXCJTaG93IGxvYWRpbmcgdmlldyB3aGVuIGJlYXV0aWZ5aW5nXCJcbiAgICB9XG4iXX0=
