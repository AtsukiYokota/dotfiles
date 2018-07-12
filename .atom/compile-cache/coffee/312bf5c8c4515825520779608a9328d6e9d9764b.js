(function() {
  var EscapeCharacterRegex, cachedMatchesBySelector, getCachedMatch, parseScopeChain, selectorForScopeChain, selectorsMatchScopeChain, setCachedMatch, slick;

  slick = require('atom-slick');

  EscapeCharacterRegex = /[-!"#$%&'*+,\/:;=?@|^~()<>{}[\]]/g;

  cachedMatchesBySelector = new WeakMap;

  getCachedMatch = function(selector, scopeChain) {
    var cachedMatchesByScopeChain;
    if (cachedMatchesByScopeChain = cachedMatchesBySelector.get(selector)) {
      return cachedMatchesByScopeChain[scopeChain];
    }
  };

  setCachedMatch = function(selector, scopeChain, match) {
    var cachedMatchesByScopeChain;
    if (!(cachedMatchesByScopeChain = cachedMatchesBySelector.get(selector))) {
      cachedMatchesByScopeChain = {};
      cachedMatchesBySelector.set(selector, cachedMatchesByScopeChain);
    }
    return cachedMatchesByScopeChain[scopeChain] = match;
  };

  parseScopeChain = function(scopeChain) {
    var i, len, ref, ref1, results, scope;
    scopeChain = scopeChain.replace(EscapeCharacterRegex, function(match) {
      return "\\" + match[0];
    });
    ref1 = (ref = slick.parse(scopeChain)[0]) != null ? ref : [];
    results = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      scope = ref1[i];
      results.push(scope);
    }
    return results;
  };

  selectorForScopeChain = function(selectors, scopeChain) {
    var cachedMatch, i, len, scopes, selector;
    for (i = 0, len = selectors.length; i < len; i++) {
      selector = selectors[i];
      cachedMatch = getCachedMatch(selector, scopeChain);
      if (cachedMatch != null) {
        if (cachedMatch) {
          return selector;
        } else {
          continue;
        }
      } else {
        scopes = parseScopeChain(scopeChain);
        while (scopes.length > 0) {
          if (selector.matches(scopes)) {
            setCachedMatch(selector, scopeChain, true);
            return selector;
          }
          scopes.pop();
        }
        setCachedMatch(selector, scopeChain, false);
      }
    }
    return null;
  };

  selectorsMatchScopeChain = function(selectors, scopeChain) {
    return selectorForScopeChain(selectors, scopeChain) != null;
  };

  module.exports = {
    parseScopeChain: parseScopeChain,
    selectorsMatchScopeChain: selectorsMatchScopeChain,
    selectorForScopeChain: selectorForScopeChain
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL3Njb3BlLWhlbHBlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFlBQVI7O0VBRVIsb0JBQUEsR0FBdUI7O0VBRXZCLHVCQUFBLEdBQTBCLElBQUk7O0VBRTlCLGNBQUEsR0FBaUIsU0FBQyxRQUFELEVBQVcsVUFBWDtBQUNmLFFBQUE7SUFBQSxJQUFHLHlCQUFBLEdBQTRCLHVCQUF1QixDQUFDLEdBQXhCLENBQTRCLFFBQTVCLENBQS9CO0FBQ0UsYUFBTyx5QkFBMEIsQ0FBQSxVQUFBLEVBRG5DOztFQURlOztFQUlqQixjQUFBLEdBQWlCLFNBQUMsUUFBRCxFQUFXLFVBQVgsRUFBdUIsS0FBdkI7QUFDZixRQUFBO0lBQUEsSUFBQSxDQUFPLENBQUEseUJBQUEsR0FBNEIsdUJBQXVCLENBQUMsR0FBeEIsQ0FBNEIsUUFBNUIsQ0FBNUIsQ0FBUDtNQUNFLHlCQUFBLEdBQTRCO01BQzVCLHVCQUF1QixDQUFDLEdBQXhCLENBQTRCLFFBQTVCLEVBQXNDLHlCQUF0QyxFQUZGOztXQUdBLHlCQUEwQixDQUFBLFVBQUEsQ0FBMUIsR0FBd0M7RUFKekI7O0VBTWpCLGVBQUEsR0FBa0IsU0FBQyxVQUFEO0FBQ2hCLFFBQUE7SUFBQSxVQUFBLEdBQWEsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsb0JBQW5CLEVBQXlDLFNBQUMsS0FBRDthQUFXLElBQUEsR0FBSyxLQUFNLENBQUEsQ0FBQTtJQUF0QixDQUF6QztBQUNiO0FBQUE7U0FBQSxzQ0FBQTs7bUJBQUE7QUFBQTs7RUFGZ0I7O0VBSWxCLHFCQUFBLEdBQXdCLFNBQUMsU0FBRCxFQUFZLFVBQVo7QUFDdEIsUUFBQTtBQUFBLFNBQUEsMkNBQUE7O01BQ0UsV0FBQSxHQUFjLGNBQUEsQ0FBZSxRQUFmLEVBQXlCLFVBQXpCO01BQ2QsSUFBRyxtQkFBSDtRQUNFLElBQUcsV0FBSDtBQUNFLGlCQUFPLFNBRFQ7U0FBQSxNQUFBO0FBR0UsbUJBSEY7U0FERjtPQUFBLE1BQUE7UUFNRSxNQUFBLEdBQVMsZUFBQSxDQUFnQixVQUFoQjtBQUNULGVBQU0sTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBdEI7VUFDRSxJQUFHLFFBQVEsQ0FBQyxPQUFULENBQWlCLE1BQWpCLENBQUg7WUFDRSxjQUFBLENBQWUsUUFBZixFQUF5QixVQUF6QixFQUFxQyxJQUFyQztBQUNBLG1CQUFPLFNBRlQ7O1VBR0EsTUFBTSxDQUFDLEdBQVAsQ0FBQTtRQUpGO1FBS0EsY0FBQSxDQUFlLFFBQWYsRUFBeUIsVUFBekIsRUFBcUMsS0FBckMsRUFaRjs7QUFGRjtXQWdCQTtFQWpCc0I7O0VBbUJ4Qix3QkFBQSxHQUEyQixTQUFDLFNBQUQsRUFBWSxVQUFaO1dBQ3pCO0VBRHlCOztFQUczQixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUFDLGlCQUFBLGVBQUQ7SUFBa0IsMEJBQUEsd0JBQWxCO0lBQTRDLHVCQUFBLHFCQUE1Qzs7QUExQ2pCIiwic291cmNlc0NvbnRlbnQiOlsic2xpY2sgPSByZXF1aXJlICdhdG9tLXNsaWNrJ1xuXG5Fc2NhcGVDaGFyYWN0ZXJSZWdleCA9IC9bLSFcIiMkJSYnKissLzo7PT9AfF5+KCk8Pnt9W1xcXV0vZ1xuXG5jYWNoZWRNYXRjaGVzQnlTZWxlY3RvciA9IG5ldyBXZWFrTWFwXG5cbmdldENhY2hlZE1hdGNoID0gKHNlbGVjdG9yLCBzY29wZUNoYWluKSAtPlxuICBpZiBjYWNoZWRNYXRjaGVzQnlTY29wZUNoYWluID0gY2FjaGVkTWF0Y2hlc0J5U2VsZWN0b3IuZ2V0KHNlbGVjdG9yKVxuICAgIHJldHVybiBjYWNoZWRNYXRjaGVzQnlTY29wZUNoYWluW3Njb3BlQ2hhaW5dXG5cbnNldENhY2hlZE1hdGNoID0gKHNlbGVjdG9yLCBzY29wZUNoYWluLCBtYXRjaCkgLT5cbiAgdW5sZXNzIGNhY2hlZE1hdGNoZXNCeVNjb3BlQ2hhaW4gPSBjYWNoZWRNYXRjaGVzQnlTZWxlY3Rvci5nZXQoc2VsZWN0b3IpXG4gICAgY2FjaGVkTWF0Y2hlc0J5U2NvcGVDaGFpbiA9IHt9XG4gICAgY2FjaGVkTWF0Y2hlc0J5U2VsZWN0b3Iuc2V0KHNlbGVjdG9yLCBjYWNoZWRNYXRjaGVzQnlTY29wZUNoYWluKVxuICBjYWNoZWRNYXRjaGVzQnlTY29wZUNoYWluW3Njb3BlQ2hhaW5dID0gbWF0Y2hcblxucGFyc2VTY29wZUNoYWluID0gKHNjb3BlQ2hhaW4pIC0+XG4gIHNjb3BlQ2hhaW4gPSBzY29wZUNoYWluLnJlcGxhY2UgRXNjYXBlQ2hhcmFjdGVyUmVnZXgsIChtYXRjaCkgLT4gXCJcXFxcI3ttYXRjaFswXX1cIlxuICBzY29wZSBmb3Igc2NvcGUgaW4gc2xpY2sucGFyc2Uoc2NvcGVDaGFpbilbMF0gPyBbXVxuXG5zZWxlY3RvckZvclNjb3BlQ2hhaW4gPSAoc2VsZWN0b3JzLCBzY29wZUNoYWluKSAtPlxuICBmb3Igc2VsZWN0b3IgaW4gc2VsZWN0b3JzXG4gICAgY2FjaGVkTWF0Y2ggPSBnZXRDYWNoZWRNYXRjaChzZWxlY3Rvciwgc2NvcGVDaGFpbilcbiAgICBpZiBjYWNoZWRNYXRjaD9cbiAgICAgIGlmIGNhY2hlZE1hdGNoXG4gICAgICAgIHJldHVybiBzZWxlY3RvclxuICAgICAgZWxzZVxuICAgICAgICBjb250aW51ZVxuICAgIGVsc2VcbiAgICAgIHNjb3BlcyA9IHBhcnNlU2NvcGVDaGFpbihzY29wZUNoYWluKVxuICAgICAgd2hpbGUgc2NvcGVzLmxlbmd0aCA+IDBcbiAgICAgICAgaWYgc2VsZWN0b3IubWF0Y2hlcyhzY29wZXMpXG4gICAgICAgICAgc2V0Q2FjaGVkTWF0Y2goc2VsZWN0b3IsIHNjb3BlQ2hhaW4sIHRydWUpXG4gICAgICAgICAgcmV0dXJuIHNlbGVjdG9yXG4gICAgICAgIHNjb3Blcy5wb3AoKVxuICAgICAgc2V0Q2FjaGVkTWF0Y2goc2VsZWN0b3IsIHNjb3BlQ2hhaW4sIGZhbHNlKVxuXG4gIG51bGxcblxuc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluID0gKHNlbGVjdG9ycywgc2NvcGVDaGFpbikgLT5cbiAgc2VsZWN0b3JGb3JTY29wZUNoYWluKHNlbGVjdG9ycywgc2NvcGVDaGFpbik/XG5cbm1vZHVsZS5leHBvcnRzID0ge3BhcnNlU2NvcGVDaGFpbiwgc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluLCBzZWxlY3RvckZvclNjb3BlQ2hhaW59XG4iXX0=
