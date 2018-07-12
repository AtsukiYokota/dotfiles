
/* eslint quote-props:0 */
'use strict';

// Character positions
var INDEX_OF_FUNCTION_NAME = 9; // "function X", X is at index 9
var FIRST_UPPERCASE_INDEX_IN_ASCII = 65; // A is at index 65 in ASCII
var LAST_UPPERCASE_INDEX_IN_ASCII = 90; // Z is at index 90 in ASCII

// -----------------------------------
// Values

/**
 * Get the object type string
 * @param {any} value
 * @returns {string}
 */
function getObjectType(value /* :mixed */) /* :string */{
  return Object.prototype.toString.call(value);
}

/**
 * Checks to see if a value is an object
 * @param {any} value
 * @returns {boolean}
 */
function isObject(value /* :any */) /* :boolean */{
  // null is object, hence the extra check
  return value !== null && typeof value === 'object';
}

/**
 * Checks to see if a value is an object and only an object
 * @param {any} value
 * @returns {boolean}
 */
function isPlainObject(value /* :any */) /* :boolean */{
  /* eslint no-proto:0 */
  return isObject(value) && value.__proto__ === Object.prototype;
}

/**
 * Checks to see if a value is empty
 * @param {any} value
 * @returns {boolean}
 */
function isEmpty(value /* :mixed */) /* :boolean */{
  return value == null;
}

/**
 * Is empty object
 * @param {any} value
 * @returns {boolean}
 */
function isEmptyObject(value /* :Object */) /* :boolean */{
  // We could use Object.keys, but this is more effecient
  for (var key in value) {
    if (value.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

/**
 * Is ES6+ class
 * @param {any} value
 * @returns {boolean}
 */
function isNativeClass(value /* :mixed */) /* :boolean */{
  // NOTE TO DEVELOPER: If any of this changes, isClass must also be updated
  return typeof value === 'function' && value.toString().indexOf('class') === 0;
}

/**
 * Is Conventional Class
 * Looks for function with capital first letter MyClass
 * First letter is the 9th character
 * If changed, isClass must also be updated
 * @param {any} value
 * @returns {boolean}
 */
function isConventionalClass(value /* :any */) /* :boolean */{
  if (typeof value !== 'function') return false;
  var c = value.toString().charCodeAt(INDEX_OF_FUNCTION_NAME);
  return c >= FIRST_UPPERCASE_INDEX_IN_ASCII && c <= LAST_UPPERCASE_INDEX_IN_ASCII;
}

// There use to be code here that checked for CoffeeScript's "function _Class" at index 0 (which was sound)
// But it would also check for Babel's __classCallCheck anywhere in the function, which wasn't sound
// as somewhere in the function, another class could be defined, which would provide a false positive
// So instead, proxied classes are ignored, as we can't guarantee their accuracy, would also be an ever growing set

// -----------------------------------
// Types

/**
 * Is Class
 * @param {any} value
 * @returns {boolean}
 */
function isClass(value /* :any */) /* :boolean */{
  // NOTE TO DEVELOPER: If any of this changes, you may also need to update isNativeClass
  if (typeof value !== 'function') return false;
  var s = value.toString();
  if (s.indexOf('class') === 0) return true;
  var c = s.charCodeAt(INDEX_OF_FUNCTION_NAME);
  return c >= FIRST_UPPERCASE_INDEX_IN_ASCII && c <= LAST_UPPERCASE_INDEX_IN_ASCII;
}

/**
 * Checks to see if a value is an error
 * @param {any} value
 * @returns {boolean}
 */
function isError(value /* :mixed */) /* :boolean */{
  return value instanceof Error;
}

/**
 * Checks to see if a value is a date
 * @param {any} value
 * @returns {boolean}
 */
function isDate(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Date]';
}

/**
 * Checks to see if a value is an arguments object
 * @param {any} value
 * @returns {boolean}
 */
function isArguments(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Arguments]';
}

/**
 * Checks to see if a value is a function but not an asynchronous function
 * @param {any} value
 * @returns {boolean}
 */
function isSyncFunction(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Function]';
}

/**
 * Checks to see if a value is an asynchronous function
 * @param {any} value
 * @returns {boolean}
 */
function isAsyncFunction(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object AsyncFunction]';
}

/**
 * Checks to see if a value is a function
 * @param {any} value
 * @returns {boolean}
 */
function isFunction(value /* :mixed */) /* :boolean */{
  return isSyncFunction(value) || isAsyncFunction(value);
}

/**
 * Checks to see if a value is an regex
 * @param {any} value
 * @returns {boolean}
 */
function isRegExp(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object RegExp]';
}

/**
 * Checks to see if a value is an array
 * @param {any} value
 * @returns {boolean}
 */
function isArray(value /* :mixed */) /* :boolean */{
  return typeof Array.isArray === 'function' && Array.isArray(value) || getObjectType(value) === '[object Array]';
}

/**
 * Checks to see if a valule is a number
 * @param {any} value
 * @returns {boolean}
 */
function isNumber(value /* :mixed */) /* :boolean */{
  return typeof value === 'number' || getObjectType(value) === '[object Number]';
}

/**
 * Checks to see if a value is a string
 * @param {any} value
 * @returns {boolean}
 */
function isString(value /* :mixed */) /* :boolean */{
  return typeof value === 'string' || getObjectType(value) === '[object String]';
}

/**
 * Checks to see if a valule is a boolean
 * @param {any} value
 * @returns {boolean}
 */
function isBoolean(value /* :mixed */) /* :boolean */{
  return value === true || value === false || getObjectType(value) === '[object Boolean]';
}

/**
 * Checks to see if a value is null
 * @param {any} value
 * @returns {boolean}
 */
function isNull(value /* :mixed */) /* :boolean */{
  return value === null;
}

/**
 * Checks to see if a value is undefined
 * @param {any} value
 * @returns {boolean}
 */
function isUndefined(value /* :mixed */) /* :boolean */{
  return typeof value === 'undefined';
}

/**
 * Checks to see if a value is a Map
 * @param {any} value
 * @returns {boolean}
 */
function isMap(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object Map]';
}

/**
 * Checks to see if a value is a WeakMap
 * @param {any} value
 * @returns {boolean}
 */
function isWeakMap(value /* :mixed */) /* :boolean */{
  return getObjectType(value) === '[object WeakMap]';
}

// -----------------------------------
// General

/**
 * The type mapping (type => method) to use for getType. Frozen.
 * AsyncFunction and SyncFunction are missing, as they are more specific types that people can detect afterwards.
 */
var typeMap = Object.freeze({
  array: isArray,
  boolean: isBoolean,
  date: isDate,
  error: isError,
  'class': isClass,
  'function': isFunction,
  'null': isNull,
  number: isNumber,
  regexp: isRegExp,
  string: isString,
  'undefined': isUndefined,
  map: isMap,
  weakmap: isWeakMap,
  object: isObject
});

/**
 * Get the type of the value in lowercase
 * @param {any} value
 * @param {Object} [customTypeMap] a custom type map (type => method) in case you have new types you wish to use
 * @returns {?string}
 */
function getType(value /* :mixed */) /* :?string */{
  var customTypeMap /* :Object */ = arguments.length <= 1 || arguments[1] === undefined ? typeMap : arguments[1];

  // Cycle through our type map
  for (var key in customTypeMap) {
    if (customTypeMap.hasOwnProperty(key)) {
      if (customTypeMap[key](value)) {
        return key;
      }
    }
  }

  // No type was successful
  return null;
}

// Export
module.exports = {
  getObjectType: getObjectType,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isEmpty: isEmpty,
  isEmptyObject: isEmptyObject,
  isNativeClass: isNativeClass,
  isConventionalClass: isConventionalClass,
  isClass: isClass,
  isError: isError,
  isDate: isDate,
  isArguments: isArguments,
  isSyncFunction: isSyncFunction,
  isAsyncFunction: isAsyncFunction,
  isFunction: isFunction,
  isRegExp: isRegExp,
  isArray: isArray,
  isNumber: isNumber,
  isString: isString,
  isBoolean: isBoolean,
  isNull: isNull,
  isUndefined: isUndefined,
  isMap: isMap,
  isWeakMap: isWeakMap,
  typeMap: typeMap,
  getType: getType
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9ub2RlX21vZHVsZXMvdHlwZWNoZWNrZXIvc291cmNlL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsWUFBWSxDQUFBOzs7QUFHWixJQUFNLHNCQUFzQixHQUFHLENBQUMsQ0FBQTtBQUNoQyxJQUFNLDhCQUE4QixHQUFHLEVBQUUsQ0FBQTtBQUN6QyxJQUFNLDZCQUE2QixHQUFHLEVBQUUsQ0FBQTs7Ozs7Ozs7OztBQVd4QyxTQUFTLGFBQWEsQ0FBRSxLQUFLLDRCQUE2QjtBQUN6RCxTQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtDQUM1Qzs7Ozs7OztBQU9ELFNBQVMsUUFBUSxDQUFFLEtBQUssMkJBQTRCOztBQUVuRCxTQUFPLEtBQUssS0FBSyxJQUFJLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFBO0NBQ2xEOzs7Ozs7O0FBT0QsU0FBUyxhQUFhLENBQUUsS0FBSywyQkFBNEI7O0FBRXhELFNBQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssTUFBTSxDQUFDLFNBQVMsQ0FBQTtDQUM5RDs7Ozs7OztBQU9ELFNBQVMsT0FBTyxDQUFFLEtBQUssNkJBQThCO0FBQ3BELFNBQU8sS0FBSyxJQUFJLElBQUksQ0FBQTtDQUNwQjs7Ozs7OztBQU9ELFNBQVMsYUFBYSxDQUFFLEtBQUssOEJBQStCOztBQUUzRCxPQUFLLElBQU0sR0FBRyxJQUFJLEtBQUssRUFBRTtBQUN4QixRQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDOUIsYUFBTyxLQUFLLENBQUE7S0FDWjtHQUNEO0FBQ0QsU0FBTyxJQUFJLENBQUE7Q0FDWDs7Ozs7OztBQU9ELFNBQVMsYUFBYSxDQUFFLEtBQUssNkJBQThCOztBQUUxRCxTQUFPLE9BQU8sS0FBSyxLQUFLLFVBQVUs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VjtLQUNEO0dBQ0Q7OztBQUdELFNBQU8sSUFBSSxDQUFBO0NBQ1g7OztBQUdELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDaEIsZUFBYSxFQUFiLGFBQWE7QUFDYixVQUFRLEVBQVIsUUFBUTtBQUNSLGVBQWEsRUFBYixhQUFhO0FBQ2IsU0FBTyxFQUFQLE9BQU87QUFDUCxlQUFhLEVBQWIsYUFBYTtBQUNiLGVBQWEsRUFBYixhQUFhO0FBQ2IscUJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQixTQUFPLEVBQVAsT0FBTztBQUNQLFNBQU8sRUFBUCxPQUFPO0FBQ1AsUUFBTSxFQUFOLE1BQU07QUFDTixhQUFXLEVBQVgsV0FBVztBQUNYLGdCQUFjLEVBQWQsY0FBYztBQUNkLGlCQUFlLEVBQWYsZUFBZTtBQUNmLFlBQVUsRUFBVixVQUFVO0FBQ1YsVUFBUSxFQUFSLFFBQVE7QUFDUixTQUFPLEVBQVAsT0FBTztBQUNQLFVBQVEsRUFBUixRQUFRO0FBQ1IsVUFBUSxFQUFSLFFBQVE7QUFDUixXQUFTLEVBQVQsU0FBUztBQUNULFFBQU0sRUFBTixNQUFNO0FBQ04sYUFBVyxFQUFYLFdBQVc7QUFDWCxPQUFLLEVBQUwsS0FBSztBQUNMLFdBQVMsRUFBVCxTQUFTO0FBQ1QsU0FBTyxFQUFQLE9BQU87QUFDUCxTQUFPLEVBQVAsT0FBTztDQUNQLENBQUEiLCJmaWxlIjoiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2J1aWxkL25vZGVfbW9kdWxlcy90eXBlY2hlY2tlci9zb3VyY2UvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuLyogZXNsaW50IHF1b3RlLXByb3BzOjAgKi9cbid1c2Ugc3RyaWN0J1xuXG4vLyBDaGFyYWN0ZXIgcG9zaXRpb25zXG5jb25zdCBJTkRFWF9PRl9GVU5DVElPTl9OQU1FID0gOSAgLy8gXCJmdW5jdGlvbiBYXCIsIFggaXMgYXQgaW5kZXggOVxuY29uc3QgRklSU1RfVVBQRVJDQVNFX0lOREVYX0lOX0FTQ0lJID0gNjUgIC8vIEEgaXMgYXQgaW5kZXggNjUgaW4gQVNDSUlcbmNvbnN0IExBU1RfVVBQRVJDQVNFX0lOREVYX0lOX0FTQ0lJID0gOTAgICAvLyBaIGlzIGF0IGluZGV4IDkwIGluIEFTQ0lJXG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFZhbHVlc1xuXG4vKipcbiAqIEdldCB0aGUgb2JqZWN0IHR5cGUgc3RyaW5nXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldE9iamVjdFR5cGUgKHZhbHVlIC8qIDptaXhlZCAqLykgLyogOnN0cmluZyAqLyB7XG5cdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGFuIG9iamVjdFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QgKHZhbHVlIC8qIDphbnkgKi8pIC8qIDpib29sZWFuICovIHtcblx0Ly8gbnVsbCBpcyBvYmplY3QsIGhlbmNlIHRoZSBleHRyYSBjaGVja1xuXHRyZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0J1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhbiBvYmplY3QgYW5kIG9ubHkgYW4gb2JqZWN0XG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0ICh2YWx1ZSAvKiA6YW55ICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdC8qIGVzbGludCBuby1wcm90bzowICovXG5cdHJldHVybiBpc09iamVjdCh2YWx1ZSkgJiYgdmFsdWUuX19wcm90b19fID09PSBPYmplY3QucHJvdG90eXBlXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGVtcHR5XG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0VtcHR5ICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIHZhbHVlID09IG51bGxcbn1cblxuLyoqXG4gKiBJcyBlbXB0eSBvYmplY3RcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRW1wdHlPYmplY3QgKHZhbHVlIC8qIDpPYmplY3QgKi8pIC8qIDpib29sZWFuICovIHtcblx0Ly8gV2UgY291bGQgdXNlIE9iamVjdC5rZXlzLCBidXQgdGhpcyBpcyBtb3JlIGVmZmVjaWVudFxuXHRmb3IgKGNvbnN0IGtleSBpbiB2YWx1ZSkge1xuXHRcdGlmICh2YWx1ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRydWVcbn1cblxuLyoqXG4gKiBJcyBFUzYrIGNsYXNzXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc05hdGl2ZUNsYXNzICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpib29sZWFuICovIHtcblx0Ly8gTk9URSBUTyBERVZFTE9QRVI6IElmIGFueSBvZiB0aGlzIGNoYW5nZXMsIGlzQ2xhc3MgbXVzdCBhbHNvIGJlIHVwZGF0ZWRcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWx1ZS50b1N0cmluZygpLmluZGV4T2YoJ2NsYXNzJykgPT09IDBcbn1cblxuLyoqXG4gKiBJcyBDb252ZW50aW9uYWwgQ2xhc3NcbiAqIExvb2tzIGZvciBmdW5jdGlvbiB3aXRoIGNhcGl0YWwgZmlyc3QgbGV0dGVyIE15Q2xhc3NcbiAqIEZpcnN0IGxldHRlciBpcyB0aGUgOXRoIGNoYXJhY3RlclxuICogSWYgY2hhbmdlZCwgaXNDbGFzcyBtdXN0IGFsc28gYmUgdXBkYXRlZFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNDb252ZW50aW9uYWxDbGFzcyAodmFsdWUgLyogOmFueSAqLykgLyogOmJvb2xlYW4gKi8ge1xuXHRpZiAodHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2Vcblx0Y29uc3QgYyA9IHZhbHVlLnRvU3RyaW5nKCkuY2hhckNvZGVBdChJTkRFWF9PRl9GVU5DVElPTl9OQU1FKVxuXHRyZXR1cm4gYyA+PSBGSVJTVF9VUFBFUkNBU0VfSU5ERVhfSU5fQVNDSUkgJiYgYyA8PSBMQVNUX1VQUEVSQ0FTRV9JTkRFWF9JTl9BU0NJSVxufVxuXG4vLyBUaGVyZSB1c2UgdG8gYmUgY29kZSBoZXJlIHRoYXQgY2hlY2tlZCBmb3IgQ29mZmVlU2NyaXB0J3MgXCJmdW5jdGlvbiBfQ2xhc3NcIiBhdCBpbmRleCAwICh3aGljaCB3YXMgc291bmQpXG4vLyBCdXQgaXQgd291bGQgYWxzbyBjaGVjayBmb3IgQmFiZWwncyBfX2NsYXNzQ2FsbENoZWNrIGFueXdoZXJlIGluIHRoZSBmdW5jdGlvbiwgd2hpY2ggd2Fzbid0IHNvdW5kXG4vLyBhcyBzb21ld2hlcmUgaW4gdGhlIGZ1bmN0aW9uLCBhbm90aGVyIGNsYXNzIGNvdWxkIGJlIGRlZmluZWQsIHdoaWNoIHdvdWxkIHByb3ZpZGUgYSBmYWxzZSBwb3NpdGl2ZVxuLy8gU28gaW5zdGVhZCwgcHJveGllZCBjbGFzc2VzIGFyZSBpZ25vcmVkLCBhcyB3ZSBjYW4ndCBndWFyYW50ZWUgdGhlaXIgYWNjdXJhY3ksIHdvdWxkIGFsc28gYmUgYW4gZXZlciBncm93aW5nIHNldFxuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUeXBlc1xuXG4vKipcbiAqIElzIENsYXNzXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0NsYXNzICh2YWx1ZSAvKiA6YW55ICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdC8vIE5PVEUgVE8gREVWRUxPUEVSOiBJZiBhbnkgb2YgdGhpcyBjaGFuZ2VzLCB5b3UgbWF5IGFsc28gbmVlZCB0byB1cGRhdGUgaXNOYXRpdmVDbGFzc1xuXHRpZiAodHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2Vcblx0Y29uc3QgcyA9IHZhbHVlLnRvU3RyaW5nKClcblx0aWYgKHMuaW5kZXhPZignY2xhc3MnKSA9PT0gMCkgcmV0dXJuIHRydWVcblx0Y29uc3QgYyA9IHMuY2hhckNvZGVBdChJTkRFWF9PRl9GVU5DVElPTl9OQU1FKVxuXHRyZXR1cm4gYyA+PSBGSVJTVF9VUFBFUkNBU0VfSU5ERVhfSU5fQVNDSUkgJiYgYyA8PSBMQVNUX1VQUEVSQ0FTRV9JTkRFWF9JTl9BU0NJSVxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhbiBlcnJvclxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNFcnJvciAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIEVycm9yXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGEgZGF0ZVxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNEYXRlICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBEYXRlXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYW4gYXJndW1lbnRzIG9iamVjdFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNBcmd1bWVudHMgKHZhbHVlIC8qIDptaXhlZCAqLykgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IEFyZ3VtZW50c10nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGEgZnVuY3Rpb24gYnV0IG5vdCBhbiBhc3luY2hyb25vdXMgZnVuY3Rpb25cbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzU3luY0Z1bmN0aW9uICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBGdW5jdGlvbl0nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvblxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNBc3luY0Z1bmN0aW9uICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBBc3luY0Z1bmN0aW9uXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYSBmdW5jdGlvblxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbiAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiBpc1N5bmNGdW5jdGlvbih2YWx1ZSkgfHwgaXNBc3luY0Z1bmN0aW9uKHZhbHVlKVxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhbiByZWdleFxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNSZWdFeHAgKHZhbHVlIC8qIDptaXhlZCAqLykgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIGFuIGFycmF5XG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0FycmF5ICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJyAmJiBBcnJheS5pc0FycmF5KHZhbHVlKSkgfHwgZ2V0T2JqZWN0VHlwZSh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWxlIGlzIGEgbnVtYmVyXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc051bWJlciAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8IGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBOdW1iZXJdJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhIHN0cmluZ1xuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcgKHZhbHVlIC8qIDptaXhlZCAqLykgLyogOmJvb2xlYW4gKi8ge1xuXHRyZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgU3RyaW5nXSdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWxlIGlzIGEgYm9vbGVhblxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNCb29sZWFuICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSBmYWxzZSB8fCBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nXG59XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHZhbHVlIGlzIG51bGxcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzTnVsbCAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiB2YWx1ZSA9PT0gbnVsbFxufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCdcbn1cblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGEgdmFsdWUgaXMgYSBNYXBcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzTWFwICh2YWx1ZSAvKiA6bWl4ZWQgKi8pIC8qIDpib29sZWFuICovIHtcblx0cmV0dXJuIGdldE9iamVjdFR5cGUodmFsdWUpID09PSAnW29iamVjdCBNYXBdJ1xufVxuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgYSB2YWx1ZSBpcyBhIFdlYWtNYXBcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzV2Vha01hcCAodmFsdWUgLyogOm1peGVkICovKSAvKiA6Ym9vbGVhbiAqLyB7XG5cdHJldHVybiBnZXRPYmplY3RUeXBlKHZhbHVlKSA9PT0gJ1tvYmplY3QgV2Vha01hcF0nXG59XG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEdlbmVyYWxcblxuLyoqXG4gKiBUaGUgdHlwZSBtYXBwaW5nICh0eXBlID0+IG1ldGhvZCkgdG8gdXNlIGZvciBnZXRUeXBlLiBGcm96ZW4uXG4gKiBBc3luY0Z1bmN0aW9uIGFuZCBTeW5jRnVuY3Rpb24gYXJlIG1pc3NpbmcsIGFzIHRoZXkgYXJlIG1vcmUgc3BlY2lmaWMgdHlwZXMgdGhhdCBwZW9wbGUgY2FuIGRldGVjdCBhZnRlcndhcmRzLlxuICovXG5jb25zdCB0eXBlTWFwID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGFycmF5OiBpc0FycmF5LFxuXHRib29sZWFuOiBpc0Jvb2xlYW4sXG5cdGRhdGU6IGlzRGF0ZSxcblx0ZXJyb3I6IGlzRXJyb3IsXG5cdGNsYXNzOiBpc0NsYXNzLFxuXHRmdW5jdGlvbjogaXNGdW5jdGlvbixcblx0bnVsbDogaXNOdWxsLFxuXHRudW1iZXI6IGlzTnVtYmVyLFxuXHRyZWdleHA6IGlzUmVnRXhwLFxuXHRzdHJpbmc6IGlzU3RyaW5nLFxuXHQndW5kZWZpbmVkJzogaXNVbmRlZmluZWQsXG5cdG1hcDogaXNNYXAsXG5cdHdlYWttYXA6IGlzV2Vha01hcCxcblx0b2JqZWN0OiBpc09iamVjdFxufSlcblxuLyoqXG4gKiBHZXQgdGhlIHR5cGUgb2YgdGhlIHZhbHVlIGluIGxvd2VyY2FzZVxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcGFyYW0ge09iamVjdH0gW2N1c3RvbVR5cGVNYXBdIGEgY3VzdG9tIHR5cGUgbWFwICh0eXBlID0+IG1ldGhvZCkgaW4gY2FzZSB5b3UgaGF2ZSBuZXcgdHlwZXMgeW91IHdpc2ggdG8gdXNlXG4gKiBAcmV0dXJucyB7P3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0VHlwZSAodmFsdWUgLyogOm1peGVkICovLCBjdXN0b21UeXBlTWFwIC8qIDpPYmplY3QgKi8gPSB0eXBlTWFwKSAvKiA6P3N0cmluZyAqLyB7XG5cdC8vIEN5Y2xlIHRocm91Z2ggb3VyIHR5cGUgbWFwXG5cdGZvciAoY29uc3Qga2V5IGluIGN1c3RvbVR5cGVNYXApIHtcblx0XHRpZiAoY3VzdG9tVHlwZU1hcC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRpZiAoY3VzdG9tVHlwZU1hcFtrZXldKHZhbHVlKSkge1xuXHRcdFx0XHRyZXR1cm4ga2V5XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gTm8gdHlwZSB3YXMgc3VjY2Vzc2Z1bFxuXHRyZXR1cm4gbnVsbFxufVxuXG4vLyBFeHBvcnRcbm1vZHVsZS5leHBvcnRzID0ge1xuXHRnZXRPYmplY3RUeXBlLFxuXHRpc09iamVjdCxcblx0aXNQbGFpbk9iamVjdCxcblx0aXNFbXB0eSxcblx0aXNFbXB0eU9iamVjdCxcblx0aXNOYXRpdmVDbGFzcyxcblx0aXNDb252ZW50aW9uYWxDbGFzcyxcblx0aXNDbGFzcyxcblx0aXNFcnJvcixcblx0aXNEYXRlLFxuXHRpc0FyZ3VtZW50cyxcblx0aXNTeW5jRnVuY3Rpb24sXG5cdGlzQXN5bmNGdW5jdGlvbixcblx0aXNGdW5jdGlvbixcblx0aXNSZWdFeHAsXG5cdGlzQXJyYXksXG5cdGlzTnVtYmVyLFxuXHRpc1N0cmluZyxcblx0aXNCb29sZWFuLFxuXHRpc051bGwsXG5cdGlzVW5kZWZpbmVkLFxuXHRpc01hcCxcblx0aXNXZWFrTWFwLFxuXHR0eXBlTWFwLFxuXHRnZXRUeXBlXG59XG4iXX0=