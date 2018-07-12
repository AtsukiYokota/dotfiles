Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _optionScopes = require('./option-scopes');

var _optionScopes2 = _interopRequireDefault(_optionScopes);

'use babel';

var options = {
  normalizeSlashes: {
    type: 'boolean',
    description: 'Replaces backward slashes with forward slashes on windows (if possible)',
    'default': true
  },
  maxFileCount: {
    type: 'number',
    description: 'The maximum amount of files to be handled',
    'default': 2000
  },
  suggestionPriority: {
    type: 'number',
    description: 'Suggestion priority of this provider. If set to a number larger than or equal to 1, suggestions will be displayed on top of default suggestions.',
    'default': 2
  },
  ignoredNames: {
    type: 'boolean',
    'default': true,
    description: 'Ignore items matched by the `Ignore Names` core option.'
  },
  ignoreSubmodules: {
    type: 'boolean',
    'default': false,
    description: 'Ignore submodule directories.'
  },
  ignoredPatterns: {
    type: 'array',
    'default': [],
    items: {
      type: 'string'
    },
    description: 'Ignore additional file path patterns.'
  },
  ignoreBuiltinScopes: {
    type: 'boolean',
    'default': false,
    description: 'Ignore built-in scopes and use only scopes from user configuration.'
  },
  scopes: {
    type: 'array',
    'default': [],
    items: {
      type: 'object',
      properties: {
        scopes: {
          type: ['array'],
          items: {
            type: 'string'
          }
        },
        prefixes: {
          type: ['array'],
          items: {
            type: 'string'
          }
        },
        extensions: {
          type: ['array'],
          items: {
            type: 'string'
          }
        },
        relative: {
          type: 'boolean',
          'default': true
        },
        replaceOnInsert: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: ['string', 'string']
            }
          }
        }
      }
    }
  }
};

for (var key in _optionScopes2['default']) {
  options[key] = {
    type: 'boolean',
    'default': false
  };
}

exports['default'] = options;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL2NvbmZpZy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7NEJBRXlCLGlCQUFpQjs7OztBQUYxQyxXQUFXLENBQUE7O0FBSVgsSUFBTSxPQUFPLEdBQUc7QUFDZCxrQkFBZ0IsRUFBRTtBQUNoQixRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVcsRUFBRSx5RUFBeUU7QUFDdEYsZUFBUyxJQUFJO0dBQ2Q7QUFDRCxjQUFZLEVBQUU7QUFDWixRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVcsRUFBRSwyQ0FBMkM7QUFDeEQsZUFBUyxJQUFJO0dBQ2Q7QUFDRCxvQkFBa0IsRUFBRTtBQUNsQixRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVcsRUFBRSxrSkFBa0o7QUFDL0osZUFBUyxDQUFDO0dBQ1g7QUFDRCxjQUFZLEVBQUU7QUFDWixRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsSUFBSTtBQUNiLGVBQVcsRUFBRSx5REFBeUQ7R0FDdkU7QUFDRCxrQkFBZ0IsRUFBRTtBQUNoQixRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsS0FBSztBQUNkLGVBQVcsRUFBRSwrQkFBK0I7R0FDN0M7QUFDRCxpQkFBZSxFQUFFO0FBQ2YsUUFBSSxFQUFFLE9BQU87QUFDYixlQUFTLEVBQUU7QUFDWCxTQUFLLEVBQUU7QUFDTCxVQUFJLEVBQUUsUUFBUTtLQUNmO0FBQ0QsZUFBVyxFQUFFLHVDQUF1QztHQUNyRDtBQUNELHFCQUFtQixFQUFFO0FBQ25CLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxLQUFLO0FBQ2QsZUFBVyxFQUFFLHFFQUFxRTtHQUNuRjtBQUNELFFBQU0sRUFBRTtBQUNOLFFBQUksRUFBRSxPQUFPO0FBQ2IsZUFBUyxFQUFFO0FBQ1gsU0FBSyxFQUFFO0FBQ0wsVUFBSSxFQUFFLFFBQVE7QUFDZCxnQkFBVSxFQUFFO0FBQ1YsY0FBTSxFQUFFO0FBQ04sY0FBSSxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ2YsZUFBSyxFQUFFO0FBQ0wsZ0JBQUksRUFBRSxRQUFRO1dBQ2Y7U0FDRjtBQUNELGdCQUFRLEVBQUU7QUFDUixjQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDZixlQUFLLEVBQUU7QUFDTCxnQkFBSSxFQUFFLFFBQVE7V0FDZjtTQUNGO0FBQ0Qsa0JBQVUsRUFBRTtBQUNWLGNBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNmLGVBQUssRUFBRTtBQUNMLGdCQUFJLEVBQUUsUUFBUTtXQUNmO1NBQ0Y7QUFDRCxnQkFBUSxFQUFFO0FBQ1IsY0FBSSxFQUFFLFNBQVM7QUFDZixxQkFBUyxJQUFJO1NBQ2Q7QUFDRCx1QkFBZSxFQUFFO0FBQ2YsY0FBSSxFQUFFLE9BQU87QUFDYixlQUFLLEVBQUU7QUFDTCxnQkFBSSxFQUFFLE9BQU87QUFDYixpQkFBSyxFQUFFO0FBQ0wsa0JBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUM7YUFDM0I7V0FDRjtTQUNGO09BQ0Y7S0FDRjtHQUNGO0NBQ0YsQ0FBQTs7QUFFRCxLQUFLLElBQUksR0FBRywrQkFBa0I7QUFDNUIsU0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHO0FBQ2IsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7R0FDZixDQUFBO0NBQ0Y7O3FCQUVjLE9BQU8iLCJmaWxlIjoiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wYXRocy9saWIvY29uZmlnL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IE9wdGlvblNjb3BlcyBmcm9tICcuL29wdGlvbi1zY29wZXMnXG5cbmNvbnN0IG9wdGlvbnMgPSB7XG4gIG5vcm1hbGl6ZVNsYXNoZXM6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVzY3JpcHRpb246ICdSZXBsYWNlcyBiYWNrd2FyZCBzbGFzaGVzIHdpdGggZm9yd2FyZCBzbGFzaGVzIG9uIHdpbmRvd3MgKGlmIHBvc3NpYmxlKScsXG4gICAgZGVmYXVsdDogdHJ1ZVxuICB9LFxuICBtYXhGaWxlQ291bnQ6IHtcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBtYXhpbXVtIGFtb3VudCBvZiBmaWxlcyB0byBiZSBoYW5kbGVkJyxcbiAgICBkZWZhdWx0OiAyMDAwXG4gIH0sXG4gIHN1Z2dlc3Rpb25Qcmlvcml0eToge1xuICAgIHR5cGU6ICdudW1iZXInLFxuICAgIGRlc2NyaXB0aW9uOiAnU3VnZ2VzdGlvbiBwcmlvcml0eSBvZiB0aGlzIHByb3ZpZGVyLiBJZiBzZXQgdG8gYSBudW1iZXIgbGFyZ2VyIHRoYW4gb3IgZXF1YWwgdG8gMSwgc3VnZ2VzdGlvbnMgd2lsbCBiZSBkaXNwbGF5ZWQgb24gdG9wIG9mIGRlZmF1bHQgc3VnZ2VzdGlvbnMuJyxcbiAgICBkZWZhdWx0OiAyXG4gIH0sXG4gIGlnbm9yZWROYW1lczoge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIGRlc2NyaXB0aW9uOiAnSWdub3JlIGl0ZW1zIG1hdGNoZWQgYnkgdGhlIGBJZ25vcmUgTmFtZXNgIGNvcmUgb3B0aW9uLidcbiAgfSxcbiAgaWdub3JlU3VibW9kdWxlczoge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBkZXNjcmlwdGlvbjogJ0lnbm9yZSBzdWJtb2R1bGUgZGlyZWN0b3JpZXMuJ1xuICB9LFxuICBpZ25vcmVkUGF0dGVybnM6IHtcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIGRlZmF1bHQ6IFtdLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIH0sXG4gICAgZGVzY3JpcHRpb246ICdJZ25vcmUgYWRkaXRpb25hbCBmaWxlIHBhdGggcGF0dGVybnMuJ1xuICB9LFxuICBpZ25vcmVCdWlsdGluU2NvcGVzOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIGRlc2NyaXB0aW9uOiAnSWdub3JlIGJ1aWx0LWluIHNjb3BlcyBhbmQgdXNlIG9ubHkgc2NvcGVzIGZyb20gdXNlciBjb25maWd1cmF0aW9uLidcbiAgfSxcbiAgc2NvcGVzOiB7XG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICBkZWZhdWx0OiBbXSxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHNjb3Blczoge1xuICAgICAgICAgIHR5cGU6IFsnYXJyYXknXSxcbiAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHByZWZpeGVzOiB7XG4gICAgICAgICAgdHlwZTogWydhcnJheSddLFxuICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXh0ZW5zaW9uczoge1xuICAgICAgICAgIHR5cGU6IFsnYXJyYXknXSxcbiAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlbGF0aXZlOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgcmVwbGFjZU9uSW5zZXJ0OiB7XG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgIHR5cGU6IFsnc3RyaW5nJywgJ3N0cmluZyddXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZvciAobGV0IGtleSBpbiBPcHRpb25TY29wZXMpIHtcbiAgb3B0aW9uc1trZXldID0ge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG9wdGlvbnNcbiJdfQ==