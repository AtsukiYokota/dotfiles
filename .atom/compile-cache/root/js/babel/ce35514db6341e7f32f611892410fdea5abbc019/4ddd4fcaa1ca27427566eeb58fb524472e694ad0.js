Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.execPromise = execPromise;

var _child_process = require('child_process');

'use babel';

function execPromise(cmd, options) {
  return new Promise(function (resolve, reject) {
    (0, _child_process.exec)(cmd, options, function (err, stdout, stderr) {
      if (err) {
        return reject(err);
      }
      resolve(stdout);
    });
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OzZCQUVxQixlQUFlOztBQUZwQyxXQUFXLENBQUE7O0FBSUosU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRTtBQUN4QyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0Qyw2QkFBSyxHQUFHLEVBQUUsT0FBTyxFQUFFLFVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUs7QUFDMUMsVUFBSSxHQUFHLEVBQUU7QUFDUCxlQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNwQjtBQUNELGFBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNqQixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiIvaG9tZS95b2tvdGEvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBhdGhzL2xpYi91dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7IGV4ZWMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuXG5leHBvcnQgZnVuY3Rpb24gZXhlY1Byb21pc2UoY21kLCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZXhlYyhjbWQsIG9wdGlvbnMsIChlcnIsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUoc3Rkb3V0KTtcbiAgICB9KTtcbiAgfSk7XG59XG4iXX0=