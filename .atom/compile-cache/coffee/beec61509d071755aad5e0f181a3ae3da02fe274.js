(function() {
  var CompositeDisposable, RenameDialog, StatusIcon,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  RenameDialog = null;

  module.exports = StatusIcon = (function(superClass) {
    extend(StatusIcon, superClass);

    function StatusIcon() {
      return StatusIcon.__super__.constructor.apply(this, arguments);
    }

    StatusIcon.prototype.active = false;

    StatusIcon.prototype.initialize = function(terminalView) {
      var ref;
      this.terminalView = terminalView;
      this.classList.add('pio-terminal-status-icon');
      this.icon = document.createElement('i');
      this.icon.classList.add('icon', 'icon-terminal');
      this.appendChild(this.icon);
      this.name = document.createElement('span');
      this.name.classList.add('name');
      this.appendChild(this.name);
      this.dataset.type = (ref = this.terminalView.constructor) != null ? ref.name : void 0;
      this.addEventListener('click', (function(_this) {
        return function(arg) {
          var ctrlKey, which;
          which = arg.which, ctrlKey = arg.ctrlKey;
          if (which === 1) {
            _this.terminalView.toggle();
            return true;
          } else if (which === 2) {
            _this.terminalView.destroy();
            return false;
          }
        };
      })(this));
      return this.setupTooltip();
    };

    StatusIcon.prototype.setupTooltip = function() {
      var onMouseEnter;
      onMouseEnter = (function(_this) {
        return function(event) {
          if (event.detail === 'platformio-ide-terminal') {
            return;
          }
          return _this.updateTooltip();
        };
      })(this);
      this.mouseEnterSubscription = {
        dispose: (function(_this) {
          return function() {
            _this.removeEventListener('mouseenter', onMouseEnter);
            return _this.mouseEnterSubscription = null;
          };
        })(this)
      };
      return this.addEventListener('mouseenter', onMouseEnter);
    };

    StatusIcon.prototype.updateTooltip = function() {
      var process;
      this.removeTooltip();
      if (process = this.terminalView.getTerminalTitle()) {
        this.tooltip = atom.tooltips.add(this, {
          title: process,
          html: false,
          delay: {
            show: 1000,
            hide: 100
          }
        });
      }
      return this.dispatchEvent(new CustomEvent('mouseenter', {
        bubbles: true,
        detail: 'platformio-ide-terminal'
      }));
    };

    StatusIcon.prototype.removeTooltip = function() {
      if (this.tooltip) {
        this.tooltip.dispose();
      }
      return this.tooltip = null;
    };

    StatusIcon.prototype.destroy = function() {
      this.removeTooltip();
      if (this.mouseEnterSubscription) {
        this.mouseEnterSubscription.dispose();
      }
      return this.remove();
    };

    StatusIcon.prototype.activate = function() {
      this.classList.add('active');
      return this.active = true;
    };

    StatusIcon.prototype.isActive = function() {
      return this.classList.contains('active');
    };

    StatusIcon.prototype.deactivate = function() {
      this.classList.remove('active');
      return this.active = false;
    };

    StatusIcon.prototype.toggle = function() {
      if (this.active) {
        this.classList.remove('active');
      } else {
        this.classList.add('active');
      }
      return this.active = !this.active;
    };

    StatusIcon.prototype.isActive = function() {
      return this.active;
    };

    StatusIcon.prototype.rename = function() {
      var dialog;
      if (RenameDialog == null) {
        RenameDialog = require('./rename-dialog');
      }
      dialog = new RenameDialog(this);
      return dialog.attach();
    };

    StatusIcon.prototype.getName = function() {
      return this.name.textContent.substring(1);
    };

    StatusIcon.prototype.updateName = function(name) {
      if (name !== this.getName()) {
        if (name) {
          name = "&nbsp;" + name;
        }
        this.name.innerHTML = name;
        return this.terminalView.emit('did-change-title');
      }
    };

    return StatusIcon;

  })(HTMLElement);

  module.exports = document.registerElement('pio-terminal-status-icon', {
    prototype: StatusIcon.prototype,
    "extends": 'li'
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9zdGF0dXMtaWNvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsWUFBQSxHQUFlOztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7eUJBQ0osTUFBQSxHQUFROzt5QkFFUixVQUFBLEdBQVksU0FBQyxZQUFEO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxlQUFEO01BQ1gsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsMEJBQWY7TUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCO01BQ1IsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBaEIsQ0FBb0IsTUFBcEIsRUFBNEIsZUFBNUI7TUFDQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxJQUFkO01BRUEsSUFBQyxDQUFBLElBQUQsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLE1BQXBCO01BQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsSUFBZDtNQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxzREFBeUMsQ0FBRTtNQUUzQyxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDekIsY0FBQTtVQUQyQixtQkFBTztVQUNsQyxJQUFHLEtBQUEsS0FBUyxDQUFaO1lBQ0UsS0FBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQUE7bUJBQ0EsS0FGRjtXQUFBLE1BR0ssSUFBRyxLQUFBLEtB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akI7YUFDVCxNQUFNLENBQUMsTUFBUCxDQUFBO0lBSE07O3lCQUtSLE9BQUEsR0FBUyxTQUFBO2FBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBbEIsQ0FBNEIsQ0FBNUI7SUFBSDs7eUJBRVQsVUFBQSxHQUFZLFNBQUMsSUFBRDtNQUNWLElBQUcsSUFBQSxLQUFVLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBYjtRQUNFLElBQTBCLElBQTFCO1VBQUEsSUFBQSxHQUFPLFFBQUEsR0FBVyxLQUFsQjs7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7ZUFDbEIsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQW1CLGtCQUFuQixFQUhGOztJQURVOzs7O0tBeEZXOztFQThGekIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsMEJBQXpCLEVBQXFEO0lBQUEsU0FBQSxFQUFXLFVBQVUsQ0FBQyxTQUF0QjtJQUFpQyxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBQTFDO0dBQXJEO0FBbkdqQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cblJlbmFtZURpYWxvZyA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3RhdHVzSWNvbiBleHRlbmRzIEhUTUxFbGVtZW50XG4gIGFjdGl2ZTogZmFsc2VcblxuICBpbml0aWFsaXplOiAoQHRlcm1pbmFsVmlldykgLT5cbiAgICBAY2xhc3NMaXN0LmFkZCAncGlvLXRlcm1pbmFsLXN0YXR1cy1pY29uJ1xuXG4gICAgQGljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpJylcbiAgICBAaWNvbi5jbGFzc0xpc3QuYWRkICdpY29uJywgJ2ljb24tdGVybWluYWwnXG4gICAgQGFwcGVuZENoaWxkKEBpY29uKVxuXG4gICAgQG5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBAbmFtZS5jbGFzc0xpc3QuYWRkICduYW1lJ1xuICAgIEBhcHBlbmRDaGlsZChAbmFtZSlcblxuICAgIEBkYXRhc2V0LnR5cGUgPSBAdGVybWluYWxWaWV3LmNvbnN0cnVjdG9yPy5uYW1lXG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoe3doaWNoLCBjdHJsS2V5fSkgPT5cbiAgICAgIGlmIHdoaWNoIGlzIDFcbiAgICAgICAgQHRlcm1pbmFsVmlldy50b2dnbGUoKVxuICAgICAgICB0cnVlXG4gICAgICBlbHNlIGlmIHdoaWNoIGlzIDJcbiAgICAgICAgQHRlcm1pbmFsVmlldy5kZXN0cm95KClcbiAgICAgICAgZmFsc2VcblxuICAgIEBzZXR1cFRvb2x0aXAoKVxuXG4gIHNldHVwVG9vbHRpcDogLT5cblxuICAgIG9uTW91c2VFbnRlciA9IChldmVudCkgPT5cbiAgICAgIHJldHVybiBpZiBldmVudC5kZXRhaWwgaXMgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsJ1xuICAgICAgQHVwZGF0ZVRvb2x0aXAoKVxuXG4gICAgQG1vdXNlRW50ZXJTdWJzY3JpcHRpb24gPSBkaXNwb3NlOiA9PlxuICAgICAgQHJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG4gICAgICBAbW91c2VFbnRlclN1YnNjcmlwdGlvbiA9IG51bGxcblxuICAgIEBhZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXG4gIHVwZGF0ZVRvb2x0aXA6IC0+XG4gICAgQHJlbW92ZVRvb2x0aXAoKVxuXG4gICAgaWYgcHJvY2VzcyA9IEB0ZXJtaW5hbFZpZXcuZ2V0VGVybWluYWxUaXRsZSgpXG4gICAgICBAdG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIHRoaXMsXG4gICAgICAgIHRpdGxlOiBwcm9jZXNzXG4gICAgICAgIGh0bWw6IGZhbHNlXG4gICAgICAgIGRlbGF5OlxuICAgICAgICAgIHNob3c6IDEwMDBcbiAgICAgICAgICBoaWRlOiAxMDBcblxuICAgIEBkaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnbW91c2VlbnRlcicsIGJ1YmJsZXM6IHRydWUsIGRldGFpbDogJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsJykpXG5cbiAgcmVtb3ZlVG9vbHRpcDogLT5cbiAgICBAdG9vbHRpcC5kaXNwb3NlKCkgaWYgQHRvb2x0aXBcbiAgICBAdG9vbHRpcCA9IG51bGxcblxuICBkZXN0cm95OiAtPlxuICAgIEByZW1vdmVUb29sdGlwKClcbiAgICBAbW91c2VFbnRlclN1YnNjcmlwdGlvbi5kaXNwb3NlKCkgaWYgQG1vdXNlRW50ZXJTdWJzY3JpcHRpb25cbiAgICBAcmVtb3ZlKClcblxuICBhY3RpdmF0ZTogLT5cbiAgICBAY2xhc3NMaXN0LmFkZCAnYWN0aXZlJ1xuICAgIEBhY3RpdmUgPSB0cnVlXG5cbiAgaXNBY3RpdmU6IC0+XG4gICAgQGNsYXNzTGlzdC5jb250YWlucyAnYWN0aXZlJ1xuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGNsYXNzTGlzdC5yZW1vdmUgJ2FjdGl2ZSdcbiAgICBAYWN0aXZlID0gZmFsc2VcblxuICB0b2dnbGU6IC0+XG4gICAgaWYgQGFjdGl2ZVxuICAgICAgQGNsYXNzTGlzdC5yZW1vdmUgJ2FjdGl2ZSdcbiAgICBlbHNlXG4gICAgICBAY2xhc3NMaXN0LmFkZCAnYWN0aXZlJ1xuICAgIEBhY3RpdmUgPSAhQGFjdGl2ZVxuXG4gIGlzQWN0aXZlOiAtPlxuICAgIHJldHVybiBAYWN0aXZlXG5cbiAgcmVuYW1lOiAtPlxuICAgIFJlbmFtZURpYWxvZyA/PSByZXF1aXJlICcuL3JlbmFtZS1kaWFsb2cnXG4gICAgZGlhbG9nID0gbmV3IFJlbmFtZURpYWxvZyB0aGlzXG4gICAgZGlhbG9nLmF0dGFjaCgpXG5cbiAgZ2V0TmFtZTogLT4gQG5hbWUudGV4dENvbnRlbnQuc3Vic3RyaW5nKDEpXG5cbiAgdXBkYXRlTmFtZTogKG5hbWUpIC0+XG4gICAgaWYgbmFtZSBpc250IEBnZXROYW1lKClcbiAgICAgIG5hbWUgPSBcIiZuYnNwO1wiICsgbmFtZSBpZiBuYW1lXG4gICAgICBAbmFtZS5pbm5lckhUTUwgPSBuYW1lXG4gICAgICBAdGVybWluYWxWaWV3LmVtaXQgJ2RpZC1jaGFuZ2UtdGl0bGUnXG5cbm1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50KCdwaW8tdGVybWluYWwtc3RhdHVzLWljb24nLCBwcm90b3R5cGU6IFN0YXR1c0ljb24ucHJvdG90eXBlLCBleHRlbmRzOiAnbGknKVxuIl19
