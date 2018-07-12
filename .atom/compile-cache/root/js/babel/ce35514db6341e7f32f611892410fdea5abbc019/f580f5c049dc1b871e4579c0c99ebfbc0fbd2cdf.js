'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = [{
  scopes: ['source.js', 'source.js.jsx', 'source.coffee', 'source.coffee.jsx', 'source.ts', 'source.tsx'],
  prefixes: ['import\\s+.*?from\\s+[\'"]', // import foo from './foo'
  'import\\s+[\'"]', // import './foo'
  'require\\([\'"]', // require('./foo')
  'define\\(\\[?[\'"]' // define(['./foo']) or define('./foo')
  ],
  extensions: ['js', 'jsx', 'ts', 'tsx', 'coffee', 'json'],
  relative: true,
  replaceOnInsert: [['([\\/]?index)?\\.jsx?$', ''], ['([\\/]?index)?\\.ts$', ''], ['([\\/]?index)?\\.coffee$', '']]
}, {
  scopes: ['text.html.vue'],
  prefixes: ['import\\s+.*?from\\s+[\'"]', // import foo from './foo'
  'import\\s+[\'"]', // import './foo'
  'require\\([\'"]', // require('./foo')
  'define\\(\\[?[\'"]' // define(['./foo']) or define('./foo')
  ],
  extensions: ['js', 'jsx', 'vue', 'ts', 'tsx', 'coffee'],
  relative: true,
  replaceOnInsert: [['\\.jsx?$', ''], ['\\.ts$', ''], ['\\.coffee$', '']]
}, {
  scopes: ['text.html.vue'],
  prefixes: ['@import[\\(|\\s+]?[\'"]' // @import 'foo' or @import('foo')
  ],
  extensions: ['css', 'sass', 'scss', 'less', 'styl'],
  relative: true,
  replaceOnInsert: [['(/)?_([^/]*?)$', '$1$2'] // dir1/_dir2/_file.sass => dir1/_dir2/file.sass
  ]
}, {
  scopes: ['source.coffee', 'source.coffee.jsx'],
  prefixes: ['require\\s+[\'"]', // require './foo'
  'define\\s+\\[?[\'"]' // define(['./foo']) or define('./foo')
  ],
  extensions: ['js', 'jsx', 'ts', 'tsx', 'coffee'],
  relative: true,
  replaceOnInsert: [['\\.jsx?$', ''], ['\\.ts$', ''], ['\\.coffee$', '']]
}, {
  scopes: ['source.php'],
  prefixes: ['require_once\\([\'"]', // require_once('foo.php')
  'include\\([\'"]' // include('./foo.php')
  ],
  extensions: ['php'],
  relative: true
}, {
  scopes: ['source.sass', 'source.css.scss', 'source.css.less', 'source.stylus'],
  prefixes: ['@import[\\(|\\s+]?[\'"]' // @import 'foo' or @import('foo')
  ],
  extensions: ['sass', 'scss', 'css'],
  relative: true,
  replaceOnInsert: [['(/)?_([^/]*?)$', '$1$2'] // dir1/_dir2/_file.sass => dir1/_dir2/file.sass
  ]
}, {
  scopes: ['source.css'],
  prefixes: ['@import\\s+[\'"]?', // @import 'foo.css'
  '@import\\s+url\\([\'"]?' // @import url('foo.css')
  ],
  extensions: ['css'],
  relative: true
}, {
  scopes: ['source.css', 'source.sass', 'source.css.less', 'source.css.scss', 'source.stylus'],
  prefixes: ['url\\([\'"]?'],
  extensions: ['png', 'gif', 'jpeg', 'jpg', 'woff', 'ttf', 'svg', 'otf'],
  relative: true
}, {
  scopes: ['source.c', 'source.cpp'],
  prefixes: ['^\\s*#include\\s+[\'"]'],
  extensions: ['h', 'hpp'],
  relative: true,
  includeCurrentDirectory: false
}, {
  scopes: ['source.lua'],
  prefixes: ['require[\\s+|\\(][\'"]'],
  extensions: ['lua'],
  relative: true,
  includeCurrentDirectory: false,
  replaceOnInsert: [['\\/', '.'], ['\\\\', '.'], ['\\.lua$', '']]
}, {
  scopes: ['source.ruby'],
  prefixes: ['^\\s*require[\\s+|\\(][\'"]'],
  extensions: ['rb'],
  relative: true,
  includeCurrentDirectory: false,
  replaceOnInsert: [['\\.rb$', '']]
}, {
  scopes: ['source.python'],
  prefixes: ['^\\s*from\\s+', '^\\s*import\\s+'],
  extensions: ['py'],
  relative: true,
  includeCurrentDirectory: false,
  replaceOnInsert: [['\\/', '.'], ['\\\\', '.'], ['\\.py$', '']]
}];
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL2NvbmZpZy9kZWZhdWx0LXNjb3Blcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7O3FCQUVJLENBQ2I7QUFDRSxRQUFNLEVBQUUsQ0FBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDO0FBQ3ZHLFVBQVEsRUFBRSxDQUNSLDRCQUE0QjtBQUM1QixtQkFBaUI7QUFDakIsbUJBQWlCO0FBQ2pCLHNCQUFvQjtHQUNyQjtBQUNELFlBQVUsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDO0FBQ3hELFVBQVEsRUFBRSxJQUFJO0FBQ2QsaUJBQWUsRUFBRSxDQUNmLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxDQUFDLEVBQzlCLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDLEVBQzVCLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxDQUFDLENBQ2pDO0NBQ0YsRUFDRDtBQUNFLFFBQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQztBQUN6QixVQUFRLEVBQUUsQ0FDUiw0QkFBNEI7QUFDNUIsbUJBQWlCO0FBQ2pCLG1CQUFpQjtBQUNqQixzQkFBb0I7R0FDckI7QUFDRCxZQUFVLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQztBQUN2RCxVQUFRLEVBQUUsSUFBSTtBQUNkLGlCQUFlLEVBQUUsQ0FDZixDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsRUFDaEIsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQ2QsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQ25CO0NBQ0YsRUFDRDtBQUNFLFFBQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQztB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O0FBQzlCLGlCQUFlLEVBQUUsQ0FDZixDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FDZjtDQUNGLEVBQ0Q7QUFDRSxRQUFNLEVBQUUsQ0FBQyxlQUFlLENBQUM7QUFDekIsVUFBUSxFQUFFLENBQ1IsZUFBZSxFQUNmLGlCQUFpQixDQUNsQjtBQUNELFlBQVUsRUFBRSxDQUFDLElBQUksQ0FBQztBQUNsQixVQUFRLEVBQUUsSUFBSTtBQUNkLHlCQUF1QixFQUFFLEtBQUs7QUFDOUIsaUJBQWUsRUFBRSxDQUNmLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUNaLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUNiLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUNmO0NBQ0YsQ0FDRiIsImZpbGUiOiIvaG9tZS95b2tvdGEvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBhdGhzL2xpYi9jb25maWcvZGVmYXVsdC1zY29wZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5leHBvcnQgZGVmYXVsdCBbXG4gIHtcbiAgICBzY29wZXM6IFsnc291cmNlLmpzJywgJ3NvdXJjZS5qcy5qc3gnLCAnc291cmNlLmNvZmZlZScsICdzb3VyY2UuY29mZmVlLmpzeCcsICdzb3VyY2UudHMnLCAnc291cmNlLnRzeCddLFxuICAgIHByZWZpeGVzOiBbXG4gICAgICAnaW1wb3J0XFxcXHMrLio/ZnJvbVxcXFxzK1tcXCdcIl0nLCAvLyBpbXBvcnQgZm9vIGZyb20gJy4vZm9vJ1xuICAgICAgJ2ltcG9ydFxcXFxzK1tcXCdcIl0nLCAvLyBpbXBvcnQgJy4vZm9vJ1xuICAgICAgJ3JlcXVpcmVcXFxcKFtcXCdcIl0nLCAvLyByZXF1aXJlKCcuL2ZvbycpXG4gICAgICAnZGVmaW5lXFxcXChcXFxcWz9bXFwnXCJdJyAvLyBkZWZpbmUoWycuL2ZvbyddKSBvciBkZWZpbmUoJy4vZm9vJylcbiAgICBdLFxuICAgIGV4dGVuc2lvbnM6IFsnanMnLCAnanN4JywgJ3RzJywgJ3RzeCcsICdjb2ZmZWUnLCAnanNvbiddLFxuICAgIHJlbGF0aXZlOiB0cnVlLFxuICAgIHJlcGxhY2VPbkluc2VydDogW1xuICAgICAgWycoW1xcXFwvXT9pbmRleCk/XFxcXC5qc3g/JCcsICcnXSxcbiAgICAgIFsnKFtcXFxcL10/aW5kZXgpP1xcXFwudHMkJywgJyddLFxuICAgICAgWycoW1xcXFwvXT9pbmRleCk/XFxcXC5jb2ZmZWUkJywgJyddXG4gICAgXVxuICB9LFxuICB7XG4gICAgc2NvcGVzOiBbJ3RleHQuaHRtbC52dWUnXSxcbiAgICBwcmVmaXhlczogW1xuICAgICAgJ2ltcG9ydFxcXFxzKy4qP2Zyb21cXFxccytbXFwnXCJdJywgLy8gaW1wb3J0IGZvbyBmcm9tICcuL2ZvbydcbiAgICAgICdpbXBvcnRcXFxccytbXFwnXCJdJywgLy8gaW1wb3J0ICcuL2ZvbydcbiAgICAgICdyZXF1aXJlXFxcXChbXFwnXCJdJywgLy8gcmVxdWlyZSgnLi9mb28nKVxuICAgICAgJ2RlZmluZVxcXFwoXFxcXFs/W1xcJ1wiXScgLy8gZGVmaW5lKFsnLi9mb28nXSkgb3IgZGVmaW5lKCcuL2ZvbycpXG4gICAgXSxcbiAgICBleHRlbnNpb25zOiBbJ2pzJywgJ2pzeCcsICd2dWUnLCAndHMnLCAndHN4JywgJ2NvZmZlZSddLFxuICAgIHJlbGF0aXZlOiB0cnVlLFxuICAgIHJlcGxhY2VPbkluc2VydDogW1xuICAgICAgWydcXFxcLmpzeD8kJywgJyddLFxuICAgICAgWydcXFxcLnRzJCcsICcnXSxcbiAgICAgIFsnXFxcXC5jb2ZmZWUkJywgJyddXG4gICAgXVxuICB9LFxuICB7XG4gICAgc2NvcGVzOiBbJ3RleHQuaHRtbC52dWUnXSxcbiAgICBwcmVmaXhlczogW1xuICAgICAgJ0BpbXBvcnRbXFxcXCh8XFxcXHMrXT9bXFwnXCJdJyAvLyBAaW1wb3J0ICdmb28nIG9yIEBpbXBvcnQoJ2ZvbycpXG4gICAgXSxcbiAgICBleHRlbnNpb25zOiBbJ2NzcycsICdzYXNzJywgJ3Njc3MnLCAnbGVzcycsICdzdHlsJ10sXG4gICAgcmVsYXRpdmU6IHRydWUsXG4gICAgcmVwbGFjZU9uSW5zZXJ0OiBbXG4gICAgICBbJygvKT9fKFteL10qPykkJywgJyQxJDInXSAvLyBkaXIxL19kaXIyL19maWxlLnNhc3MgPT4gZGlyMS9fZGlyMi9maWxlLnNhc3NcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBzY29wZXM6IFsnc291cmNlLmNvZmZlZScsICdzb3VyY2UuY29mZmVlLmpzeCddLFxuICAgIHByZWZpeGVzOiBbXG4gICAgICAncmVxdWlyZVxcXFxzK1tcXCdcIl0nLCAvLyByZXF1aXJlICcuL2ZvbydcbiAgICAgICdkZWZpbmVcXFxccytcXFxcWz9bXFwnXCJdJyAvLyBkZWZpbmUoWycuL2ZvbyddKSBvciBkZWZpbmUoJy4vZm9vJylcbiAgICBdLFxuICAgIGV4dGVuc2lvbnM6IFsnanMnLCAnanN4JywgJ3RzJywgJ3RzeCcsICdjb2ZmZWUnXSxcbiAgICByZWxhdGl2ZTogdHJ1ZSxcbiAgICByZXBsYWNlT25JbnNlcnQ6IFtcbiAgICAgIFsnXFxcXC5qc3g/JCcsICcnXSxcbiAgICAgIFsnXFxcXC50cyQnLCAnJ10sXG4gICAgICBbJ1xcXFwuY29mZmVlJCcsICcnXVxuICAgIF1cbiAgfSxcbiAge1xuICAgIHNjb3BlczogWydzb3VyY2UucGhwJ10sXG4gICAgcHJlZml4ZXM6IFtcbiAgICAgICdyZXF1aXJlX29uY2VcXFxcKFtcXCdcIl0nLCAvLyByZXF1aXJlX29uY2UoJ2Zvby5waHAnKVxuICAgICAgJ2luY2x1ZGVcXFxcKFtcXCdcIl0nIC8vIGluY2x1ZGUoJy4vZm9vLnBocCcpXG4gICAgXSxcbiAgICBleHRlbnNpb25zOiBbJ3BocCddLFxuICAgIHJlbGF0aXZlOiB0cnVlXG4gIH0sXG4gIHtcbiAgICBzY29wZXM6IFsnc291cmNlLnNhc3MnLCAnc291cmNlLmNzcy5zY3NzJywgJ3NvdXJjZS5jc3MubGVzcycsICdzb3VyY2Uuc3R5bHVzJ10sXG4gICAgcHJlZml4ZXM6IFtcbiAgICAgICdAaW1wb3J0W1xcXFwofFxcXFxzK10/W1xcJ1wiXScgLy8gQGltcG9ydCAnZm9vJyBvciBAaW1wb3J0KCdmb28nKVxuICAgIF0sXG4gICAgZXh0ZW5zaW9uczogWydzYXNzJywgJ3Njc3MnLCAnY3NzJ10sXG4gICAgcmVsYXRpdmU6IHRydWUsXG4gICAgcmVwbGFjZU9uSW5zZXJ0OiBbXG4gICAgICBbJygvKT9fKFteL10qPykkJywgJyQxJDInXSAvLyBkaXIxL19kaXIyL19maWxlLnNhc3MgPT4gZGlyMS9fZGlyMi9maWxlLnNhc3NcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBzY29wZXM6IFsnc291cmNlLmNzcyddLFxuICAgIHByZWZpeGVzOiBbXG4gICAgICAnQGltcG9ydFxcXFxzK1tcXCdcIl0/JywgLy8gQGltcG9ydCAnZm9vLmNzcydcbiAgICAgICdAaW1wb3J0XFxcXHMrdXJsXFxcXChbXFwnXCJdPycgLy8gQGltcG9ydCB1cmwoJ2Zvby5jc3MnKVxuICAgIF0sXG4gICAgZXh0ZW5zaW9uczogWydjc3MnXSxcbiAgICByZWxhdGl2ZTogdHJ1ZVxuICB9LFxuICB7XG4gICAgc2NvcGVzOiBbJ3NvdXJjZS5jc3MnLCAnc291cmNlLnNhc3MnLCAnc291cmNlLmNzcy5sZXNzJywgJ3NvdXJjZS5jc3Muc2NzcycsICdzb3VyY2Uuc3R5bHVzJ10sXG4gICAgcHJlZml4ZXM6IFtcbiAgICAgICd1cmxcXFxcKFtcXCdcIl0/J1xuICAgIF0sXG4gICAgZXh0ZW5zaW9uczogWydwbmcnLCAnZ2lmJywgJ2pwZWcnLCAnanBnJywgJ3dvZmYnLCAndHRmJywgJ3N2ZycsICdvdGYnXSxcbiAgICByZWxhdGl2ZTogdHJ1ZVxuICB9LFxuICB7XG4gICAgc2NvcGVzOiBbJ3NvdXJjZS5jJywgJ3NvdXJjZS5jcHAnXSxcbiAgICBwcmVmaXhlczogW1xuICAgICAgJ15cXFxccyojaW5jbHVkZVxcXFxzK1tcXCdcIl0nXG4gICAgXSxcbiAgICBleHRlbnNpb25zOiBbJ2gnLCAnaHBwJ10sXG4gICAgcmVsYXRpdmU6IHRydWUsXG4gICAgaW5jbHVkZUN1cnJlbnREaXJlY3Rvcnk6IGZhbHNlXG4gIH0sXG4gIHtcbiAgICBzY29wZXM6IFsnc291cmNlLmx1YSddLFxuICAgIHByZWZpeGVzOiBbXG4gICAgICAncmVxdWlyZVtcXFxccyt8XFxcXChdW1xcJ1wiXSdcbiAgICBdLFxuICAgIGV4dGVuc2lvbnM6IFsnbHVhJ10sXG4gICAgcmVsYXRpdmU6IHRydWUsXG4gICAgaW5jbHVkZUN1cnJlbnREaXJlY3Rvcnk6IGZhbHNlLFxuICAgIHJlcGxhY2VPbkluc2VydDogW1xuICAgICAgWydcXFxcLycsICcuJ10sXG4gICAgICBbJ1xcXFxcXFxcJywgJy4nXSxcbiAgICAgIFsnXFxcXC5sdWEkJywgJyddXG4gICAgXVxuICB9LFxuICB7XG4gICAgc2NvcGVzOiBbJ3NvdXJjZS5ydWJ5J10sXG4gICAgcHJlZml4ZXM6IFtcbiAgICAgICdeXFxcXHMqcmVxdWlyZVtcXFxccyt8XFxcXChdW1xcJ1wiXSdcbiAgICBdLFxuICAgIGV4dGVuc2lvbnM6IFsncmInXSxcbiAgICByZWxhdGl2ZTogdHJ1ZSxcbiAgICBpbmNsdWRlQ3VycmVudERpcmVjdG9yeTogZmFsc2UsXG4gICAgcmVwbGFjZU9uSW5zZXJ0OiBbXG4gICAgICBbJ1xcXFwucmIkJywgJyddXG4gICAgXVxuICB9LFxuICB7XG4gICAgc2NvcGVzOiBbJ3NvdXJjZS5weXRob24nXSxcbiAgICBwcmVmaXhlczogW1xuICAgICAgJ15cXFxccypmcm9tXFxcXHMrJyxcbiAgICAgICdeXFxcXHMqaW1wb3J0XFxcXHMrJ1xuICAgIF0sXG4gICAgZXh0ZW5zaW9uczogWydweSddLFxuICAgIHJlbGF0aXZlOiB0cnVlLFxuICAgIGluY2x1ZGVDdXJyZW50RGlyZWN0b3J5OiBmYWxzZSxcbiAgICByZXBsYWNlT25JbnNlcnQ6IFtcbiAgICAgIFsnXFxcXC8nLCAnLiddLFxuICAgICAgWydcXFxcXFxcXCcsICcuJ10sXG4gICAgICBbJ1xcXFwucHkkJywgJyddXG4gICAgXVxuICB9XG5dXG4iXX0=