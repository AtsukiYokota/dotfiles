(function() {
  var StatusBarView,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports = StatusBarView = (function() {
    function StatusBarView() {
      this.removeElement = bind(this.removeElement, this);
      this.getElement = bind(this.getElement, this);
      this.element = document.createElement('div');
      this.element.classList.add("highlight-selected-status", "inline-block");
    }

    StatusBarView.prototype.updateCount = function(count) {
      this.element.textContent = "Highlighted: " + count;
      if (count === 0) {
        return this.element.classList.add("highlight-selected-hidden");
      } else {
        return this.element.classList.remove("highlight-selected-hidden");
      }
    };

    StatusBarView.prototype.getElement = function() {
      return this.element;
    };

    StatusBarView.prototype.removeElement = function() {
      this.element.parentNode.removeChild(this.element);
      return this.element = null;
    };

    return StatusBarView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2hpZ2hsaWdodC1zZWxlY3RlZC9saWIvc3RhdHVzLWJhci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsYUFBQTtJQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyx1QkFBQTs7O01BQ1gsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLDJCQUF2QixFQUFtRCxjQUFuRDtJQUZXOzs0QkFJYixXQUFBLEdBQWEsU0FBQyxLQUFEO01BQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULEdBQXVCLGVBQUEsR0FBa0I7TUFDekMsSUFBRyxLQUFBLEtBQVMsQ0FBWjtlQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLDJCQUF2QixFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQW5CLENBQTBCLDJCQUExQixFQUhGOztJQUZXOzs0QkFPYixVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQTtJQURTOzs0QkFHWixhQUFBLEdBQWUsU0FBQTtNQUNiLElBQUMsQ0FBQSxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQXBCLENBQWdDLElBQUMsQ0FBQSxPQUFqQzthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFGRTs7Ozs7QUFoQmpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3RhdHVzQmFyVmlld1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaGlnaGxpZ2h0LXNlbGVjdGVkLXN0YXR1c1wiLFwiaW5saW5lLWJsb2NrXCIpXG5cbiAgdXBkYXRlQ291bnQ6IChjb3VudCkgLT5cbiAgICBAZWxlbWVudC50ZXh0Q29udGVudCA9IFwiSGlnaGxpZ2h0ZWQ6IFwiICsgY291bnRcbiAgICBpZiBjb3VudCA9PSAwXG4gICAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaGlnaGxpZ2h0LXNlbGVjdGVkLWhpZGRlblwiKVxuICAgIGVsc2VcbiAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWdobGlnaHQtc2VsZWN0ZWQtaGlkZGVuXCIpXG5cbiAgZ2V0RWxlbWVudDogPT5cbiAgICBAZWxlbWVudFxuXG4gIHJlbW92ZUVsZW1lbnQ6ID0+XG4gICAgQGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChAZWxlbWVudClcbiAgICBAZWxlbWVudCA9IG51bGxcbiJdfQ==
