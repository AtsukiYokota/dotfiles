(function() {
  var $, CompositeDisposable, PlatformIOTerminalView, StatusBar, StatusIcon, View, _, os, path, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, View = ref.View;

  PlatformIOTerminalView = require('./view');

  StatusIcon = require('./status-icon');

  os = require('os');

  path = require('path');

  _ = require('underscore');

  module.exports = StatusBar = (function(superClass) {
    extend(StatusBar, superClass);

    function StatusBar() {
      this.moveTerminalView = bind(this.moveTerminalView, this);
      this.onDropTabBar = bind(this.onDropTabBar, this);
      this.onDrop = bind(this.onDrop, this);
      this.onDragOver = bind(this.onDragOver, this);
      this.onDragEnd = bind(this.onDragEnd, this);
      this.onDragLeave = bind(this.onDragLeave, this);
      this.onDragStart = bind(this.onDragStart, this);
      this.closeAll = bind(this.closeAll, this);
      return StatusBar.__super__.constructor.apply(this, arguments);
    }

    StatusBar.prototype.terminalViews = [];

    StatusBar.prototype.activeTerminal = null;

    StatusBar.prototype.returnFocus = null;

    StatusBar.content = function() {
      return this.div({
        "class": 'platformio-ide-terminal status-bar',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.i({
            "class": "icon icon-plus",
            click: 'newTerminalView',
            outlet: 'plusBtn'
          });
          _this.ul({
            "class": "list-inline status-container",
            tabindex: '-1',
            outlet: 'statusContainer',
            is: 'space-pen-ul'
          });
          return _this.i({
            "class": "icon icon-x",
            click: 'closeAll',
            outlet: 'closeBtn'
          });
        };
      })(this));
    };

    StatusBar.prototype.initialize = function(statusBarProvider) {
      var handleBlur, handleFocus;
      this.statusBarProvider = statusBarProvider;
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'platformio-ide-terminal:focus': (function(_this) {
          return function() {
            return _this.focusTerminal();
          };
        })(this),
        'platformio-ide-terminal:new': (function(_this) {
          return function() {
            return _this.newTerminalView();
          };
        })(this),
        'platformio-ide-terminal:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'platformio-ide-terminal:next': (function(_this) {
          return function() {
            if (!_this.activeTerminal) {
              return;
            }
            if (_this.activeTerminal.isAnimating()) {
              return;
            }
            if (_this.activeNextTerminalView()) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'platformio-ide-terminal:prev': (function(_this) {
          return function() {
            if (!_this.activeTerminal) {
              return;
            }
            if (_this.activeTerminal.isAnimating()) {
              return;
            }
            if (_this.activePrevTerminalView()) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'platformio-ide-terminal:clear': (function(_this) {
          return function() {
            return _this.clear();
          };
        })(this),
        'platformio-ide-terminal:close': (function(_this) {
          return function() {
            return _this.destroyActiveTerm();
          };
        })(this),
        'platformio-ide-terminal:close-all': (function(_this) {
          return function() {
            return _this.closeAll();
          };
        })(this),
        'platformio-ide-terminal:rename': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.rename();
            });
          };
        })(this),
        'platformio-ide-terminal:insert-selected-text': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection('$S');
            });
          };
        })(this),
        'platformio-ide-terminal:insert-text': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.inputDialog();
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-1': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText1'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-2': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText2'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-3': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText3'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-4': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText4'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-5': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText5'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-6': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText6'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-7': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText7'));
            });
          };
        })(this),
        'platformio-ide-terminal:insert-custom-text-8': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('platformio-ide-terminal.customTexts.customText8'));
            });
          };
        })(this),
        'platformio-ide-terminal:fullscreen': (function(_this) {
          return function() {
            return _this.activeTerminal.maximize();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.xterm', {
        'platformio-ide-terminal:paste': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.paste();
            });
          };
        })(this),
        'platformio-ide-terminal:copy': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.copy();
            });
          };
        })(this)
      }));
      this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          var mapping, nextTerminal, prevTerminal;
          if (item == null) {
            return;
          }
          if (item.constructor.name === "PlatformIOTerminalView") {
            return setTimeout(item.focus, 100);
          } else if (item.constructor.name === "TextEditor") {
            mapping = atom.config.get('platformio-ide-terminal.core.mapTerminalsTo');
            if (mapping === 'None') {
              return;
            }
            if (!item.getPath()) {
              return;
            }
            switch (mapping) {
              case 'File':
                nextTerminal = _this.getTerminalById(item.getPath(), function(view) {
                  return view.getId().filePath;
                });
                break;
              case 'Folder':
                nextTerminal = _this.getTerminalById(path.dirname(item.getPath()), function(view) {
                  return view.getId().folderPath;
                });
            }
            prevTerminal = _this.getActiveTerminalView();
            if (prevTerminal !== nextTerminal) {
              if (nextTerminal == null) {
                if (atom.config.get('platformio-ide-terminal.core.mapTerminalsToAutoOpen')) {
                  return nextTerminal = _this.createTerminalView();
                }
              } else {
                _this.setActiveTerminalView(nextTerminal);
                if (prevTerminal != null ? prevTerminal.panel.isVisible() : void 0) {
                  return nextTerminal.toggle();
                }
              }
            }
          }
        };
      })(this)));
      this.registerContextMenu();
      this.subscriptions.add(atom.tooltips.add(this.plusBtn, {
        title: 'New Terminal'
      }));
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close All'
      }));
      this.statusContainer.on('dblclick', (function(_this) {
        return function(event) {
          if (event.target === event.delegateTarget) {
            return _this.newTerminalView();
          }
        };
      })(this));
      this.statusContainer.on('dragstart', '.pio-terminal-status-icon', this.onDragStart);
      this.statusContainer.on('dragend', '.pio-terminal-status-icon', this.onDragEnd);
      this.statusContainer.on('dragleave', this.onDragLeave);
      this.statusContainer.on('dragover', this.onDragOver);
      this.statusContainer.on('drop', this.onDrop);
      handleBlur = (function(_this) {
        return function() {
          var terminal;
          if (terminal = PlatformIOTerminalView.getFocusedTerminal()) {
            _this.returnFocus = _this.terminalViewForTerminal(terminal);
            return terminal.blur();
          }
        };
      })(this);
      handleFocus = (function(_this) {
        return function() {
          if (_this.returnFocus) {
            return setTimeout(function() {
              var ref1;
              if ((ref1 = _this.returnFocus) != null) {
                ref1.focus(true);
              }
              return _this.returnFocus = null;
            }, 100);
          }
        };
      })(this);
      window.addEventListener('blur', handleBlur);
      this.subscriptions.add({
        dispose: function() {
          return window.removeEventListener('blur', handleBlur);
        }
      });
      window.addEventListener('focus', handleFocus);
      this.subscriptions.add({
        dispose: function() {
          return window.removeEventListener('focus', handleFocus);
        }
      });
      return this.attach();
    };

    StatusBar.prototype.registerContextMenu = function() {
      return this.subscriptions.add(atom.commands.add('.platformio-ide-terminal.status-bar', {
        'platformio-ide-terminal:status-red': this.setStatusColor,
        'platformio-ide-terminal:status-orange': this.setStatusColor,
        'platformio-ide-terminal:status-yellow': this.setStatusColor,
        'platformio-ide-terminal:status-green': this.setStatusColor,
        'platformio-ide-terminal:status-blue': this.setStatusColor,
        'platformio-ide-terminal:status-purple': this.setStatusColor,
        'platformio-ide-terminal:status-pink': this.setStatusColor,
        'platformio-ide-terminal:status-cyan': this.setStatusColor,
        'platformio-ide-terminal:status-magenta': this.setStatusColor,
        'platformio-ide-terminal:status-default': this.clearStatusColor,
        'platformio-ide-terminal:context-close': function(event) {
          return $(event.target).closest('.pio-terminal-status-icon')[0].terminalView.destroy();
        },
        'platformio-ide-terminal:context-hide': function(event) {
          var statusIcon;
          statusIcon = $(event.target).closest('.pio-terminal-status-icon')[0];
          if (statusIcon.isActive()) {
            return statusIcon.terminalView.hide();
          }
        },
        'platformio-ide-terminal:context-rename': function(event) {
          return $(event.target).closest('.pio-terminal-status-icon')[0].rename();
        }
      }));
    };

    StatusBar.prototype.registerPaneSubscription = function() {
      return this.subscriptions.add(this.paneSubscription = atom.workspace.observePanes((function(_this) {
        return function(pane) {
          var paneElement, tabBar;
          paneElement = $(atom.views.getView(pane));
          tabBar = paneElement.find('ul');
          tabBar.on('drop', function(event) {
            return _this.onDropTabBar(event, pane);
          });
          tabBar.on('dragstart', function(event) {
            var ref1;
            if (((ref1 = event.target.item) != null ? ref1.constructor.name : void 0) !== 'PlatformIOTerminalView') {
              return;
            }
            return event.originalEvent.dataTransfer.setData('platformio-ide-terminal-tab', 'true');
          });
          return pane.onDidDestroy(function() {
            return tabBar.off('drop', this.onDropTabBar);
          });
        };
      })(this)));
    };

    StatusBar.prototype.createTerminalView = function(autoRun) {
      var args, env, shell, shellArguments, shellEnv;
      shell = atom.config.get('platformio-ide-terminal.core.shell');
      shellArguments = atom.config.get('platformio-ide-terminal.core.shellArguments');
      args = shellArguments.split(/\s+/g).filter(function(arg) {
        return arg;
      });
      shellEnv = atom.config.get('platformio-ide-terminal.core.shellEnv');
      env = {};
      shellEnv.split(' ').forEach((function(_this) {
        return function(element) {
          var configVar, envVar;
          configVar = element.split('=');
          envVar = {};
          envVar[configVar[0]] = configVar[1];
          return env = _.extend(env, envVar);
        };
      })(this));
      return this.createEmptyTerminalView(autoRun, shell, args, env);
    };

    StatusBar.prototype.createEmptyTerminalView = function(autoRun, shell, args, env) {
      var directory, editorFolder, editorPath, home, id, j, len, platformIOTerminalView, projectFolder, pwd, ref1, ref2, statusIcon;
      if (autoRun == null) {
        autoRun = [];
      }
      if (shell == null) {
        shell = null;
      }
      if (args == null) {
        args = [];
      }
      if (env == null) {
        env = {};
      }
      if (this.paneSubscription == null) {
        this.registerPaneSubscription();
      }
      projectFolder = atom.project.getPaths()[0];
      editorPath = (ref1 = atom.workspace.getActiveTextEditor()) != null ? ref1.getPath() : void 0;
      if (editorPath != null) {
        editorFolder = path.dirname(editorPath);
        ref2 = atom.project.getPaths();
        for (j = 0, len = ref2.length; j < len; j++) {
          directory = ref2[j];
          if (editorPath.indexOf(directory) >= 0) {
            projectFolder = directory;
          }
        }
      }
      if ((projectFolder != null ? projectFolder.indexOf('atom://') : void 0) >= 0) {
        projectFolder = void 0;
      }
      home = process.platform === 'win32' ? process.env.HOMEPATH : process.env.HOME;
      switch (atom.config.get('platformio-ide-terminal.core.workingDirectory')) {
        case 'Project':
          pwd = projectFolder || editorFolder || home;
          break;
        case 'Active File':
          pwd = editorFolder || projectFolder || home;
          break;
        default:
          pwd = home;
      }
      id = editorPath || projectFolder || home;
      id = {
        filePath: id,
        folderPath: path.dirname(id)
      };
      statusIcon = new StatusIcon();
      platformIOTerminalView = new PlatformIOTerminalView(id, pwd, statusIcon, this, shell, args, env, autoRun);
      statusIcon.initialize(platformIOTerminalView);
      platformIOTerminalView.attach();
      this.terminalViews.push(platformIOTerminalView);
      this.statusContainer.append(statusIcon);
      return platformIOTerminalView;
    };

    StatusBar.prototype.activeNextTerminalView = function() {
      var index;
      index = this.indexOf(this.activeTerminal);
      if (index < 0) {
        return false;
      }
      return this.activeTerminalView(index + 1);
    };

    StatusBar.prototype.activePrevTerminalView = function() {
      var index;
      index = this.indexOf(this.activeTerminal);
      if (index < 0) {
        return false;
      }
      return this.activeTerminalView(index - 1);
    };

    StatusBar.prototype.indexOf = function(view) {
      return this.terminalViews.indexOf(view);
    };

    StatusBar.prototype.activeTerminalView = function(index) {
      if (this.terminalViews.length < 2) {
        return false;
      }
      if (index >= this.terminalViews.length) {
        index = 0;
      }
      if (index < 0) {
        index = this.terminalViews.length - 1;
      }
      this.activeTerminal = this.terminalViews[index];
      return true;
    };

    StatusBar.prototype.getActiveTerminalView = function() {
      return this.activeTerminal;
    };

    StatusBar.prototype.focusTerminal = function() {
      var terminal;
      if (this.activeTerminal == null) {
        return;
      }
      if (terminal = PlatformIOTerminalView.getFocusedTerminal()) {
        return this.activeTerminal.blur();
      } else {
        return this.activeTerminal.focusTerminal();
      }
    };

    StatusBar.prototype.getTerminalById = function(target, selector) {
      var index, j, ref1, terminal;
      if (selector == null) {
        selector = function(terminal) {
          return terminal.id;
        };
      }
      for (index = j = 0, ref1 = this.terminalViews.length; 0 <= ref1 ? j <= ref1 : j >= ref1; index = 0 <= ref1 ? ++j : --j) {
        terminal = this.terminalViews[index];
        if (terminal != null) {
          if (selector(terminal) === target) {
            return terminal;
          }
        }
      }
      return null;
    };

    StatusBar.prototype.terminalViewForTerminal = function(terminal) {
      var index, j, ref1, terminalView;
      for (index = j = 0, ref1 = this.terminalViews.length; 0 <= ref1 ? j <= ref1 : j >= ref1; index = 0 <= ref1 ? ++j : --j) {
        terminalView = this.terminalViews[index];
        if (terminalView != null) {
          if (terminalView.getTerminal() === terminal) {
            return terminalView;
          }
        }
      }
      return null;
    };

    StatusBar.prototype.runInActiveView = function(callback) {
      var view;
      view = this.getActiveTerminalView();
      if (view != null) {
        return callback(view);
      }
      return null;
    };

    StatusBar.prototype.runNewTerminal = function() {
      this.activeTerminal = this.createEmptyTerminalView();
      this.activeTerminal.toggle();
      return this.activeTerminal;
    };

    StatusBar.prototype.runCommandInNewTerminal = function(commands) {
      this.activeTerminal = this.createTerminalView(commands);
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.runInOpenView = function(callback) {
      var view;
      view = this.getActiveTerminalView();
      if ((view != null) && view.panel.isVisible()) {
        return callback(view);
      }
      return null;
    };

    StatusBar.prototype.setActiveTerminalView = function(view) {
      return this.activeTerminal = view;
    };

    StatusBar.prototype.removeTerminalView = function(view) {
      var index;
      index = this.indexOf(view);
      if (index < 0) {
        return;
      }
      this.terminalViews.splice(index, 1);
      return this.activateAdjacentTerminal(index);
    };

    StatusBar.prototype.activateAdjacentTerminal = function(index) {
      if (index == null) {
        index = 0;
      }
      if (!(this.terminalViews.length > 0)) {
        return false;
      }
      index = Math.max(0, index - 1);
      this.activeTerminal = this.terminalViews[index];
      return true;
    };

    StatusBar.prototype.newTerminalView = function() {
      var ref1;
      if ((ref1 = this.activeTerminal) != null ? ref1.animating : void 0) {
        return;
      }
      this.activeTerminal = this.createTerminalView();
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.attach = function() {
      return this.statusBarProvider.addLeftTile({
        item: this,
        priority: -93
      });
    };

    StatusBar.prototype.destroyActiveTerm = function() {
      var index;
      if (this.activeTerminal == null) {
        return;
      }
      index = this.indexOf(this.activeTerminal);
      this.activeTerminal.destroy();
      this.activeTerminal = null;
      return this.activateAdjacentTerminal(index);
    };

    StatusBar.prototype.closeAll = function() {
      var index, j, ref1, view;
      for (index = j = ref1 = this.terminalViews.length; ref1 <= 0 ? j <= 0 : j >= 0; index = ref1 <= 0 ? ++j : --j) {
        view = this.terminalViews[index];
        if (view != null) {
          view.destroy();
        }
      }
      return this.activeTerminal = null;
    };

    StatusBar.prototype.destroy = function() {
      var j, len, ref1, view;
      this.subscriptions.dispose();
      ref1 = this.terminalViews;
      for (j = 0, len = ref1.length; j < len; j++) {
        view = ref1[j];
        view.ptyProcess.terminate();
        view.terminal.destroy();
      }
      return this.detach();
    };

    StatusBar.prototype.toggle = function() {
      if (this.terminalViews.length === 0) {
        this.activeTerminal = this.createTerminalView();
      } else if (this.activeTerminal === null) {
        this.activeTerminal = this.terminalViews[0];
      }
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.clear = function() {
      this.destroyActiveTerm();
      return this.newTerminalView();
    };

    StatusBar.prototype.setStatusColor = function(event) {
      var color;
      color = event.type.match(/\w+$/)[0];
      color = atom.config.get("platformio-ide-terminal.iconColors." + color).toRGBAString();
      return $(event.target).closest('.pio-terminal-status-icon').css('color', color);
    };

    StatusBar.prototype.clearStatusColor = function(event) {
      return $(event.target).closest('.pio-terminal-status-icon').css('color', '');
    };

    StatusBar.prototype.onDragStart = function(event) {
      var element;
      event.originalEvent.dataTransfer.setData('platformio-ide-terminal-panel', 'true');
      element = $(event.target).closest('.pio-terminal-status-icon');
      element.addClass('is-dragging');
      return event.originalEvent.dataTransfer.setData('from-index', element.index());
    };

    StatusBar.prototype.onDragLeave = function(event) {
      return this.removePlaceholder();
    };

    StatusBar.prototype.onDragEnd = function(event) {
      return this.clearDropTarget();
    };

    StatusBar.prototype.onDragOver = function(event) {
      var element, newDropTargetIndex, statusIcons;
      event.preventDefault();
      event.stopPropagation();
      if (event.originalEvent.dataTransfer.getData('platformio-ide-terminal') !== 'true') {
        return;
      }
      newDropTargetIndex = this.getDropTargetIndex(event);
      if (newDropTargetIndex == null) {
        return;
      }
      this.removeDropTargetClasses();
      statusIcons = this.statusContainer.children('.pio-terminal-status-icon');
      if (newDropTargetIndex < statusIcons.length) {
        element = statusIcons.eq(newDropTargetIndex).addClass('is-drop-target');
        return this.getPlaceholder().insertBefore(element);
      } else {
        element = statusIcons.eq(newDropTargetIndex - 1).addClass('drop-target-is-after');
        return this.getPlaceholder().insertAfter(element);
      }
    };

    StatusBar.prototype.onDrop = function(event) {
      var dataTransfer, fromIndex, pane, paneIndex, panelEvent, tabEvent, toIndex, view;
      dataTransfer = event.originalEvent.dataTransfer;
      panelEvent = dataTransfer.getData('platformio-ide-terminal-panel') === 'true';
      tabEvent = dataTransfer.getData('platformio-ide-terminal-tab') === 'true';
      if (!(panelEvent || tabEvent)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      toIndex = this.getDropTargetIndex(event);
      this.clearDropTarget();
      if (tabEvent) {
        fromIndex = parseInt(dataTransfer.getData('sortable-index'));
        paneIndex = parseInt(dataTransfer.getData('from-pane-index'));
        pane = atom.workspace.getPanes()[paneIndex];
        view = pane.itemAtIndex(fromIndex);
        pane.removeItem(view, false);
        view.show();
        view.toggleTabView();
        this.terminalViews.push(view);
        if (view.statusIcon.isActive()) {
          view.open();
        }
        this.statusContainer.append(view.statusIcon);
        fromIndex = this.terminalViews.length - 1;
      } else {
        fromIndex = parseInt(dataTransfer.getData('from-index'));
      }
      return this.updateOrder(fromIndex, toIndex);
    };

    StatusBar.prototype.onDropTabBar = function(event, pane) {
      var dataTransfer, fromIndex, tabBar, view;
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('platformio-ide-terminal-panel') !== 'true') {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.clearDropTarget();
      fromIndex = parseInt(dataTransfer.getData('from-index'));
      view = this.terminalViews[fromIndex];
      view.css("height", "");
      view.terminal.element.style.height = "";
      tabBar = $(event.target).closest('.tab-bar');
      view.toggleTabView();
      this.removeTerminalView(view);
      this.statusContainer.children().eq(fromIndex).detach();
      view.statusIcon.removeTooltip();
      pane.addItem(view, pane.getItems().length);
      pane.activateItem(view);
      return view.focus();
    };

    StatusBar.prototype.clearDropTarget = function() {
      var element;
      element = this.find('.is-dragging');
      element.removeClass('is-dragging');
      this.removeDropTargetClasses();
      return this.removePlaceholder();
    };

    StatusBar.prototype.removeDropTargetClasses = function() {
      this.statusContainer.find('.is-drop-target').removeClass('is-drop-target');
      return this.statusContainer.find('.drop-target-is-after').removeClass('drop-target-is-after');
    };

    StatusBar.prototype.getDropTargetIndex = function(event) {
      var element, elementCenter, statusIcons, target;
      target = $(event.target);
      if (this.isPlaceholder(target)) {
        return;
      }
      statusIcons = this.statusContainer.children('.pio-terminal-status-icon');
      element = target.closest('.pio-terminal-status-icon');
      if (element.length === 0) {
        element = statusIcons.last();
      }
      if (!element.length) {
        return 0;
      }
      elementCenter = element.offset().left + element.width() / 2;
      if (event.originalEvent.pageX < elementCenter) {
        return statusIcons.index(element);
      } else if (element.next('.pio-terminal-status-icon').length > 0) {
        return statusIcons.index(element.next('.pio-terminal-status-icon'));
      } else {
        return statusIcons.index(element) + 1;
      }
    };

    StatusBar.prototype.getPlaceholder = function() {
      return this.placeholderEl != null ? this.placeholderEl : this.placeholderEl = $('<li class="placeholder"></li>');
    };

    StatusBar.prototype.removePlaceholder = function() {
      var ref1;
      if ((ref1 = this.placeholderEl) != null) {
        ref1.remove();
      }
      return this.placeholderEl = null;
    };

    StatusBar.prototype.isPlaceholder = function(element) {
      return element.is('.placeholder');
    };

    StatusBar.prototype.iconAtIndex = function(index) {
      return this.getStatusIcons().eq(index);
    };

    StatusBar.prototype.getStatusIcons = function() {
      return this.statusContainer.children('.pio-terminal-status-icon');
    };

    StatusBar.prototype.moveIconToIndex = function(icon, toIndex) {
      var container, followingIcon;
      followingIcon = this.getStatusIcons()[toIndex];
      container = this.statusContainer[0];
      if (followingIcon != null) {
        return container.insertBefore(icon, followingIcon);
      } else {
        return container.appendChild(icon);
      }
    };

    StatusBar.prototype.moveTerminalView = function(fromIndex, toIndex) {
      var activeTerminal, view;
      activeTerminal = this.getActiveTerminalView();
      view = this.terminalViews.splice(fromIndex, 1)[0];
      this.terminalViews.splice(toIndex, 0, view);
      return this.setActiveTerminalView(activeTerminal);
    };

    StatusBar.prototype.updateOrder = function(fromIndex, toIndex) {
      var icon;
      if (fromIndex === toIndex) {
        return;
      }
      if (fromIndex < toIndex) {
        toIndex--;
      }
      icon = this.getStatusIcons().eq(fromIndex).detach();
      this.moveIconToIndex(icon.get(0), toIndex);
      this.moveTerminalView(fromIndex, toIndex);
      icon.addClass('inserted');
      return icon.one('webkitAnimationEnd', function() {
        return icon.removeClass('inserted');
      });
    };

    return StatusBar;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9zdGF0dXMtYmFyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNkZBQUE7SUFBQTs7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUQsRUFBSTs7RUFFSixzQkFBQSxHQUF5QixPQUFBLENBQVEsUUFBUjs7RUFDekIsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUViLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztFQUVKLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7Ozs7Ozs7Ozt3QkFDSixhQUFBLEdBQWU7O3dCQUNmLGNBQUEsR0FBZ0I7O3dCQUNoQixXQUFBLEdBQWE7O0lBRWIsU0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sb0NBQVA7UUFBNkMsUUFBQSxFQUFVLENBQUMsQ0FBeEQ7T0FBTCxFQUFnRSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDOUQsS0FBQyxDQUFBLENBQUQsQ0FBRztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZ0JBQVA7WUFBeUIsS0FBQSxFQUFPLGlCQUFoQztZQUFtRCxNQUFBLEVBQVEsU0FBM0Q7V0FBSDtVQUNBLEtBQUMsQ0FBQSxFQUFELENBQUk7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDhCQUFQO1lBQXVDLFFBQUEsRUFBVSxJQUFqRDtZQUF1RCxNQUFBLEVBQVEsaUJBQS9EO1lBQWtGLEVBQUEsRUFBSSxjQUF0RjtXQUFKO2lCQUNBLEtBQUMs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QUFMLENBQWMsVUFBZDthQUNBLElBQUksQ0FBQyxHQUFMLENBQVMsb0JBQVQsRUFBK0IsU0FBQTtlQUFHLElBQUksQ0FBQyxXQUFMLENBQWlCLFVBQWpCO01BQUgsQ0FBL0I7SUFSVzs7OztLQXhkUztBQVh4QiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuUGxhdGZvcm1JT1Rlcm1pbmFsVmlldyA9IHJlcXVpcmUgJy4vdmlldydcblN0YXR1c0ljb24gPSByZXF1aXJlICcuL3N0YXR1cy1pY29uJ1xuXG5vcyA9IHJlcXVpcmUgJ29zJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3RhdHVzQmFyIGV4dGVuZHMgVmlld1xuICB0ZXJtaW5hbFZpZXdzOiBbXVxuICBhY3RpdmVUZXJtaW5hbDogbnVsbFxuICByZXR1cm5Gb2N1czogbnVsbFxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbCBzdGF0dXMtYmFyJywgdGFiaW5kZXg6IC0xLCA9PlxuICAgICAgQGkgY2xhc3M6IFwiaWNvbiBpY29uLXBsdXNcIiwgY2xpY2s6ICduZXdUZXJtaW5hbFZpZXcnLCBvdXRsZXQ6ICdwbHVzQnRuJ1xuICAgICAgQHVsIGNsYXNzOiBcImxpc3QtaW5saW5lIHN0YXR1cy1jb250YWluZXJcIiwgdGFiaW5kZXg6ICctMScsIG91dGxldDogJ3N0YXR1c0NvbnRhaW5lcicsIGlzOiAnc3BhY2UtcGVuLXVsJ1xuICAgICAgQGkgY2xhc3M6IFwiaWNvbiBpY29uLXhcIiwgY2xpY2s6ICdjbG9zZUFsbCcsIG91dGxldDogJ2Nsb3NlQnRuJ1xuXG4gIGluaXRpYWxpemU6IChAc3RhdHVzQmFyUHJvdmlkZXIpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpmb2N1cyc6ID0+IEBmb2N1c1Rlcm1pbmFsKClcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpuZXcnOiA9PiBAbmV3VGVybWluYWxWaWV3KClcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDp0b2dnbGUnOiA9PiBAdG9nZ2xlKClcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpuZXh0JzogPT5cbiAgICAgICAgcmV0dXJuIHVubGVzcyBAYWN0aXZlVGVybWluYWxcbiAgICAgICAgcmV0dXJuIGlmIEBhY3RpdmVUZXJtaW5hbC5pc0FuaW1hdGluZygpXG4gICAgICAgIEBhY3RpdmVUZXJtaW5hbC5vcGVuKCkgaWYgQGFjdGl2ZU5leHRUZXJtaW5hbFZpZXcoKVxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnByZXYnOiA9PlxuICAgICAgICByZXR1cm4gdW5sZXNzIEBhY3RpdmVUZXJtaW5hbFxuICAgICAgICByZXR1cm4gaWYgQGFjdGl2ZVRlcm1pbmFsLmlzQW5pbWF0aW5nKClcbiAgICAgICAgQGFjdGl2ZVRlcm1pbmFsLm9wZW4oKSBpZiBAYWN0aXZlUHJldlRlcm1pbmFsVmlldygpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6Y2xlYXInOiA9PiBAY2xlYXIoKVxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmNsb3NlJzogPT4gQGRlc3Ryb3lBY3RpdmVUZXJtKClcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpjbG9zZS1hbGwnOiA9PiBAY2xvc2VBbGwoKVxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnJlbmFtZSc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkucmVuYW1lKClcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtc2VsZWN0ZWQtdGV4dCc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKCckUycpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LXRleHQnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmlucHV0RGlhbG9nKClcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtMSc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDEnKSlcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtMic6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDInKSlcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtMyc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDMnKSlcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtNCc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDQnKSlcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtNSc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDUnKSlcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtNic6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDYnKSlcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtNyc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDcnKSlcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtOCc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDgnKSlcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpmdWxsc2NyZWVuJzogPT4gQGFjdGl2ZVRlcm1pbmFsLm1heGltaXplKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnLnh0ZXJtJyxcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpwYXN0ZSc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkucGFzdGUoKVxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmNvcHknOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmNvcHkoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pID0+XG4gICAgICByZXR1cm4gdW5sZXNzIGl0ZW0/XG5cbiAgICAgIGlmIGl0ZW0uY29uc3RydWN0b3IubmFtZSBpcyBcIlBsYXRmb3JtSU9UZXJtaW5hbFZpZXdcIlxuICAgICAgICBzZXRUaW1lb3V0IGl0ZW0uZm9jdXMsIDEwMFxuICAgICAgZWxzZSBpZiBpdGVtLmNvbnN0cnVjdG9yLm5hbWUgaXMgXCJUZXh0RWRpdG9yXCJcbiAgICAgICAgbWFwcGluZyA9IGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY29yZS5tYXBUZXJtaW5hbHNUbycpXG4gICAgICAgIHJldHVybiBpZiBtYXBwaW5nIGlzICdOb25lJ1xuICAgICAgICByZXR1cm4gdW5sZXNzIGl0ZW0uZ2V0UGF0aCgpXG5cbiAgICAgICAgc3dpdGNoIG1hcHBpbmdcbiAgICAgICAgICB3aGVuICdGaWxlJ1xuICAgICAgICAgICAgbmV4dFRlcm1pbmFsID0gQGdldFRlcm1pbmFsQnlJZCBpdGVtLmdldFBhdGgoKSwgKHZpZXcpIC0+IHZpZXcuZ2V0SWQoKS5maWxlUGF0aFxuICAgICAgICAgIHdoZW4gJ0ZvbGRlcidcbiAgICAgICAgICAgIG5leHRUZXJtaW5hbCA9IEBnZXRUZXJtaW5hbEJ5SWQgcGF0aC5kaXJuYW1lKGl0ZW0uZ2V0UGF0aCgpKSwgKHZpZXcpIC0+IHZpZXcuZ2V0SWQoKS5mb2xkZXJQYXRoXG5cbiAgICAgICAgcHJldlRlcm1pbmFsID0gQGdldEFjdGl2ZVRlcm1pbmFsVmlldygpXG4gICAgICAgIGlmIHByZXZUZXJtaW5hbCAhPSBuZXh0VGVybWluYWxcbiAgICAgICAgICBpZiBub3QgbmV4dFRlcm1pbmFsP1xuICAgICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb3JlLm1hcFRlcm1pbmFsc1RvQXV0b09wZW4nKVxuICAgICAgICAgICAgICBuZXh0VGVybWluYWwgPSBAY3JlYXRlVGVybWluYWxWaWV3KClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0QWN0aXZlVGVybWluYWxWaWV3KG5leHRUZXJtaW5hbClcbiAgICAgICAgICAgIG5leHRUZXJtaW5hbC50b2dnbGUoKSBpZiBwcmV2VGVybWluYWw/LnBhbmVsLmlzVmlzaWJsZSgpXG5cbiAgICBAcmVnaXN0ZXJDb250ZXh0TWVudSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQHBsdXNCdG4sIHRpdGxlOiAnTmV3IFRlcm1pbmFsJ1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAY2xvc2VCdG4sIHRpdGxlOiAnQ2xvc2UgQWxsJ1xuXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZGJsY2xpY2snLCAoZXZlbnQpID0+XG4gICAgICBAbmV3VGVybWluYWxWaWV3KCkgdW5sZXNzIGV2ZW50LnRhcmdldCAhPSBldmVudC5kZWxlZ2F0ZVRhcmdldFxuXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZHJhZ3N0YXJ0JywgJy5waW8tdGVybWluYWwtc3RhdHVzLWljb24nLCBAb25EcmFnU3RhcnRcbiAgICBAc3RhdHVzQ29udGFpbmVyLm9uICdkcmFnZW5kJywgJy5waW8tdGVybWluYWwtc3RhdHVzLWljb24nLCBAb25EcmFnRW5kXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZHJhZ2xlYXZlJywgQG9uRHJhZ0xlYXZlXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZHJhZ292ZXInLCBAb25EcmFnT3ZlclxuICAgIEBzdGF0dXNDb250YWluZXIub24gJ2Ryb3AnLCBAb25Ecm9wXG5cbiAgICBoYW5kbGVCbHVyID0gPT5cbiAgICAgIGlmIHRlcm1pbmFsID0gUGxhdGZvcm1JT1Rlcm1pbmFsVmlldy5nZXRGb2N1c2VkVGVybWluYWwoKVxuICAgICAgICBAcmV0dXJuRm9jdXMgPSBAdGVybWluYWxWaWV3Rm9yVGVybWluYWwodGVybWluYWwpXG4gICAgICAgIHRlcm1pbmFsLmJsdXIoKVxuXG4gICAgaGFuZGxlRm9jdXMgPSA9PlxuICAgICAgaWYgQHJldHVybkZvY3VzXG4gICAgICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICAgICBAcmV0dXJuRm9jdXM/LmZvY3VzKHRydWUpXG4gICAgICAgICAgQHJldHVybkZvY3VzID0gbnVsbFxuICAgICAgICAsIDEwMFxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2JsdXInLCBoYW5kbGVCbHVyXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGRpc3Bvc2U6IC0+XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnYmx1cicsIGhhbmRsZUJsdXJcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdmb2N1cycsIGhhbmRsZUZvY3VzXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGRpc3Bvc2U6IC0+XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnZm9jdXMnLCBoYW5kbGVGb2N1c1xuXG4gICAgQGF0dGFjaCgpXG5cbiAgcmVnaXN0ZXJDb250ZXh0TWVudTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy5wbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5zdGF0dXMtYmFyJyxcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpzdGF0dXMtcmVkJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6c3RhdHVzLW9yYW5nZSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnN0YXR1cy15ZWxsb3cnOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpzdGF0dXMtZ3JlZW4nOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpzdGF0dXMtYmx1ZSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnN0YXR1cy1wdXJwbGUnOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpzdGF0dXMtcGluayc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnN0YXR1cy1jeWFuJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6c3RhdHVzLW1hZ2VudGEnOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpzdGF0dXMtZGVmYXVsdCc6IEBjbGVhclN0YXR1c0NvbG9yXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6Y29udGV4dC1jbG9zZSc6IChldmVudCkgLT5cbiAgICAgICAgJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5waW8tdGVybWluYWwtc3RhdHVzLWljb24nKVswXS50ZXJtaW5hbFZpZXcuZGVzdHJveSgpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6Y29udGV4dC1oaWRlJzogKGV2ZW50KSAtPlxuICAgICAgICBzdGF0dXNJY29uID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5waW8tdGVybWluYWwtc3RhdHVzLWljb24nKVswXVxuICAgICAgICBzdGF0dXNJY29uLnRlcm1pbmFsVmlldy5oaWRlKCkgaWYgc3RhdHVzSWNvbi5pc0FjdGl2ZSgpXG4gICAgICAncGxhdGZvcm1pby1pZGUtdGVybWluYWw6Y29udGV4dC1yZW5hbWUnOiAoZXZlbnQpIC0+XG4gICAgICAgICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcucGlvLXRlcm1pbmFsLXN0YXR1cy1pY29uJylbMF0ucmVuYW1lKClcblxuICByZWdpc3RlclBhbmVTdWJzY3JpcHRpb246IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBwYW5lU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVBhbmVzIChwYW5lKSA9PlxuICAgICAgcGFuZUVsZW1lbnQgPSAkKGF0b20udmlld3MuZ2V0VmlldyhwYW5lKSlcbiAgICAgIHRhYkJhciA9IHBhbmVFbGVtZW50LmZpbmQoJ3VsJylcblxuICAgICAgdGFiQmFyLm9uICdkcm9wJywgKGV2ZW50KSA9PiBAb25Ecm9wVGFiQmFyKGV2ZW50LCBwYW5lKVxuICAgICAgdGFiQmFyLm9uICdkcmFnc3RhcnQnLCAoZXZlbnQpIC0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgZXZlbnQudGFyZ2V0Lml0ZW0/LmNvbnN0cnVjdG9yLm5hbWUgaXMgJ1BsYXRmb3JtSU9UZXJtaW5hbFZpZXcnXG4gICAgICAgIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLXRhYicsICd0cnVlJ1xuICAgICAgcGFuZS5vbkRpZERlc3Ryb3kgLT4gdGFiQmFyLm9mZiAnZHJvcCcsIEBvbkRyb3BUYWJCYXJcblxuICBjcmVhdGVUZXJtaW5hbFZpZXc6IChhdXRvUnVuKSAtPlxuICAgIHNoZWxsID0gYXRvbS5jb25maWcuZ2V0ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb3JlLnNoZWxsJ1xuICAgIHNoZWxsQXJndW1lbnRzID0gYXRvbS5jb25maWcuZ2V0ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb3JlLnNoZWxsQXJndW1lbnRzJ1xuICAgIGFyZ3MgPSBzaGVsbEFyZ3VtZW50cy5zcGxpdCgvXFxzKy9nKS5maWx0ZXIgKGFyZykgLT4gYXJnXG4gICAgc2hlbGxFbnYgPSBhdG9tLmNvbmZpZy5nZXQgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmNvcmUuc2hlbGxFbnYnXG4gICAgZW52ID0ge31cbiAgICBzaGVsbEVudi5zcGxpdCgnICcpLmZvckVhY2goKGVsZW1lbnQpID0+XG4gICAgICBjb25maWdWYXIgPSBlbGVtZW50LnNwbGl0KCc9JylcbiAgICAgIGVudlZhciA9IHt9XG4gICAgICBlbnZWYXJbY29uZmlnVmFyWzBdXSA9IGNvbmZpZ1ZhclsxXVxuICAgICAgZW52ID0gXy5leHRlbmQoZW52LCBlbnZWYXIpXG4gICAgKVxuICAgIEBjcmVhdGVFbXB0eVRlcm1pbmFsVmlldyBhdXRvUnVuLCBzaGVsbCwgYXJncywgZW52XG5cbiAgY3JlYXRlRW1wdHlUZXJtaW5hbFZpZXc6IChhdXRvUnVuPVtdLCBzaGVsbCA9IG51bGwsIGFyZ3MgPSBbXSwgZW52PSB7fSkgLT5cbiAgICBAcmVnaXN0ZXJQYW5lU3Vic2NyaXB0aW9uKCkgdW5sZXNzIEBwYW5lU3Vic2NyaXB0aW9uP1xuXG4gICAgcHJvamVjdEZvbGRlciA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgZWRpdG9yUGF0aCA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKT8uZ2V0UGF0aCgpXG5cbiAgICBpZiBlZGl0b3JQYXRoP1xuICAgICAgZWRpdG9yRm9sZGVyID0gcGF0aC5kaXJuYW1lKGVkaXRvclBhdGgpXG4gICAgICBmb3IgZGlyZWN0b3J5IGluIGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgICAgIGlmIGVkaXRvclBhdGguaW5kZXhPZihkaXJlY3RvcnkpID49IDBcbiAgICAgICAgICBwcm9qZWN0Rm9sZGVyID0gZGlyZWN0b3J5XG5cbiAgICBwcm9qZWN0Rm9sZGVyID0gdW5kZWZpbmVkIGlmIHByb2plY3RGb2xkZXI/LmluZGV4T2YoJ2F0b206Ly8nKSA+PSAwXG5cbiAgICBob21lID0gaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnd2luMzInIHRoZW4gcHJvY2Vzcy5lbnYuSE9NRVBBVEggZWxzZSBwcm9jZXNzLmVudi5IT01FXG5cbiAgICBzd2l0Y2ggYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb3JlLndvcmtpbmdEaXJlY3RvcnknKVxuICAgICAgd2hlbiAnUHJvamVjdCcgdGhlbiBwd2QgPSBwcm9qZWN0Rm9sZGVyIG9yIGVkaXRvckZvbGRlciBvciBob21lXG4gICAgICB3aGVuICdBY3RpdmUgRmlsZScgdGhlbiBwd2QgPSBlZGl0b3JGb2xkZXIgb3IgcHJvamVjdEZvbGRlciBvciBob21lXG4gICAgICBlbHNlIHB3ZCA9IGhvbWVcblxuICAgIGlkID0gZWRpdG9yUGF0aCBvciBwcm9qZWN0Rm9sZGVyIG9yIGhvbWVcbiAgICBpZCA9IGZpbGVQYXRoOiBpZCwgZm9sZGVyUGF0aDogcGF0aC5kaXJuYW1lKGlkKVxuXG4gICAgc3RhdHVzSWNvbiA9IG5ldyBTdGF0dXNJY29uKClcbiAgICBwbGF0Zm9ybUlPVGVybWluYWxWaWV3ID0gbmV3IFBsYXRmb3JtSU9UZXJtaW5hbFZpZXcoaWQsIHB3ZCwgc3RhdHVzSWNvbiwgdGhpcywgc2hlbGwsIGFyZ3MsIGVudiwgYXV0b1J1bilcbiAgICBzdGF0dXNJY29uLmluaXRpYWxpemUocGxhdGZvcm1JT1Rlcm1pbmFsVmlldylcblxuICAgIHBsYXRmb3JtSU9UZXJtaW5hbFZpZXcuYXR0YWNoKClcblxuICAgIEB0ZXJtaW5hbFZpZXdzLnB1c2ggcGxhdGZvcm1JT1Rlcm1pbmFsVmlld1xuICAgIEBzdGF0dXNDb250YWluZXIuYXBwZW5kIHN0YXR1c0ljb25cbiAgICByZXR1cm4gcGxhdGZvcm1JT1Rlcm1pbmFsVmlld1xuXG4gIGFjdGl2ZU5leHRUZXJtaW5hbFZpZXc6IC0+XG4gICAgaW5kZXggPSBAaW5kZXhPZihAYWN0aXZlVGVybWluYWwpXG4gICAgcmV0dXJuIGZhbHNlIGlmIGluZGV4IDwgMFxuICAgIEBhY3RpdmVUZXJtaW5hbFZpZXcgaW5kZXggKyAxXG5cbiAgYWN0aXZlUHJldlRlcm1pbmFsVmlldzogLT5cbiAgICBpbmRleCA9IEBpbmRleE9mKEBhY3RpdmVUZXJtaW5hbClcbiAgICByZXR1cm4gZmFsc2UgaWYgaW5kZXggPCAwXG4gICAgQGFjdGl2ZVRlcm1pbmFsVmlldyBpbmRleCAtIDFcblxuICBpbmRleE9mOiAodmlldykgLT5cbiAgICBAdGVybWluYWxWaWV3cy5pbmRleE9mKHZpZXcpXG5cbiAgYWN0aXZlVGVybWluYWxWaWV3OiAoaW5kZXgpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0ZXJtaW5hbFZpZXdzLmxlbmd0aCA8IDJcblxuICAgIGlmIGluZGV4ID49IEB0ZXJtaW5hbFZpZXdzLmxlbmd0aFxuICAgICAgaW5kZXggPSAwXG4gICAgaWYgaW5kZXggPCAwXG4gICAgICBpbmRleCA9IEB0ZXJtaW5hbFZpZXdzLmxlbmd0aCAtIDFcblxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IEB0ZXJtaW5hbFZpZXdzW2luZGV4XVxuICAgIHJldHVybiB0cnVlXG5cbiAgZ2V0QWN0aXZlVGVybWluYWxWaWV3OiAtPlxuICAgIHJldHVybiBAYWN0aXZlVGVybWluYWxcblxuICBmb2N1c1Rlcm1pbmFsOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVRlcm1pbmFsP1xuXG4gICAgaWYgdGVybWluYWwgPSBQbGF0Zm9ybUlPVGVybWluYWxWaWV3LmdldEZvY3VzZWRUZXJtaW5hbCgpXG4gICAgICAgIEBhY3RpdmVUZXJtaW5hbC5ibHVyKClcbiAgICBlbHNlXG4gICAgICAgIEBhY3RpdmVUZXJtaW5hbC5mb2N1c1Rlcm1pbmFsKClcblxuICBnZXRUZXJtaW5hbEJ5SWQ6ICh0YXJnZXQsIHNlbGVjdG9yKSAtPlxuICAgIHNlbGVjdG9yID89ICh0ZXJtaW5hbCkgLT4gdGVybWluYWwuaWRcblxuICAgIGZvciBpbmRleCBpbiBbMCAuLiBAdGVybWluYWxWaWV3cy5sZW5ndGhdXG4gICAgICB0ZXJtaW5hbCA9IEB0ZXJtaW5hbFZpZXdzW2luZGV4XVxuICAgICAgaWYgdGVybWluYWw/XG4gICAgICAgIHJldHVybiB0ZXJtaW5hbCBpZiBzZWxlY3Rvcih0ZXJtaW5hbCkgPT0gdGFyZ2V0XG5cbiAgICByZXR1cm4gbnVsbFxuXG4gIHRlcm1pbmFsVmlld0ZvclRlcm1pbmFsOiAodGVybWluYWwpIC0+XG4gICAgZm9yIGluZGV4IGluIFswIC4uIEB0ZXJtaW5hbFZpZXdzLmxlbmd0aF1cbiAgICAgIHRlcm1pbmFsVmlldyA9IEB0ZXJtaW5hbFZpZXdzW2luZGV4XVxuICAgICAgaWYgdGVybWluYWxWaWV3P1xuICAgICAgICByZXR1cm4gdGVybWluYWxWaWV3IGlmIHRlcm1pbmFsVmlldy5nZXRUZXJtaW5hbCgpID09IHRlcm1pbmFsXG5cbiAgICByZXR1cm4gbnVsbFxuXG4gIHJ1bkluQWN0aXZlVmlldzogKGNhbGxiYWNrKSAtPlxuICAgIHZpZXcgPSBAZ2V0QWN0aXZlVGVybWluYWxWaWV3KClcbiAgICBpZiB2aWV3P1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHZpZXcpXG4gICAgcmV0dXJuIG51bGxcblxuICBydW5OZXdUZXJtaW5hbDogKCkgLT5cbiAgICBAYWN0aXZlVGVybWluYWwgPSBAY3JlYXRlRW1wdHlUZXJtaW5hbFZpZXcoKVxuICAgIEBhY3RpdmVUZXJtaW5hbC50b2dnbGUoKVxuICAgIHJldHVybiBAYWN0aXZlVGVybWluYWxcblxuICBydW5Db21tYW5kSW5OZXdUZXJtaW5hbDogKGNvbW1hbmRzKSAtPlxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IEBjcmVhdGVUZXJtaW5hbFZpZXcoY29tbWFuZHMpXG4gICAgQGFjdGl2ZVRlcm1pbmFsLnRvZ2dsZSgpXG5cbiAgcnVuSW5PcGVuVmlldzogKGNhbGxiYWNrKSAtPlxuICAgIHZpZXcgPSBAZ2V0QWN0aXZlVGVybWluYWxWaWV3KClcbiAgICBpZiB2aWV3PyBhbmQgdmlldy5wYW5lbC5pc1Zpc2libGUoKVxuICAgICAgcmV0dXJuIGNhbGxiYWNrKHZpZXcpXG4gICAgcmV0dXJuIG51bGxcblxuICBzZXRBY3RpdmVUZXJtaW5hbFZpZXc6ICh2aWV3KSAtPlxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IHZpZXdcblxuICByZW1vdmVUZXJtaW5hbFZpZXc6ICh2aWV3KSAtPlxuICAgIGluZGV4ID0gQGluZGV4T2Ygdmlld1xuICAgIHJldHVybiBpZiBpbmRleCA8IDBcbiAgICBAdGVybWluYWxWaWV3cy5zcGxpY2UgaW5kZXgsIDFcblxuICAgIEBhY3RpdmF0ZUFkamFjZW50VGVybWluYWwgaW5kZXhcblxuICBhY3RpdmF0ZUFkamFjZW50VGVybWluYWw6IChpbmRleD0wKSAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgQHRlcm1pbmFsVmlld3MubGVuZ3RoID4gMFxuXG4gICAgaW5kZXggPSBNYXRoLm1heCgwLCBpbmRleCAtIDEpXG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gQHRlcm1pbmFsVmlld3NbaW5kZXhdXG5cbiAgICByZXR1cm4gdHJ1ZVxuXG4gIG5ld1Rlcm1pbmFsVmlldzogLT5cbiAgICByZXR1cm4gaWYgQGFjdGl2ZVRlcm1pbmFsPy5hbmltYXRpbmdcblxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IEBjcmVhdGVUZXJtaW5hbFZpZXcoKVxuICAgIEBhY3RpdmVUZXJtaW5hbC50b2dnbGUoKVxuXG4gIGF0dGFjaDogLT5cbiAgICBAc3RhdHVzQmFyUHJvdmlkZXIuYWRkTGVmdFRpbGUoaXRlbTogdGhpcywgcHJpb3JpdHk6IC05MylcblxuICBkZXN0cm95QWN0aXZlVGVybTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBhY3RpdmVUZXJtaW5hbD9cblxuICAgIGluZGV4ID0gQGluZGV4T2YoQGFjdGl2ZVRlcm1pbmFsKVxuICAgIEBhY3RpdmVUZXJtaW5hbC5kZXN0cm95KClcbiAgICBAYWN0aXZlVGVybWluYWwgPSBudWxsXG5cbiAgICBAYWN0aXZhdGVBZGphY2VudFRlcm1pbmFsIGluZGV4XG5cbiAgY2xvc2VBbGw6ID0+XG4gICAgZm9yIGluZGV4IGluIFtAdGVybWluYWxWaWV3cy5sZW5ndGggLi4gMF1cbiAgICAgIHZpZXcgPSBAdGVybWluYWxWaWV3c1tpbmRleF1cbiAgICAgIGlmIHZpZXc/XG4gICAgICAgIHZpZXcuZGVzdHJveSgpXG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gbnVsbFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgZm9yIHZpZXcgaW4gQHRlcm1pbmFsVmlld3NcbiAgICAgIHZpZXcucHR5UHJvY2Vzcy50ZXJtaW5hdGUoKVxuICAgICAgdmlldy50ZXJtaW5hbC5kZXN0cm95KClcbiAgICBAZGV0YWNoKClcblxuICB0b2dnbGU6IC0+XG4gICAgaWYgQHRlcm1pbmFsVmlld3MubGVuZ3RoID09IDBcbiAgICAgIEBhY3RpdmVUZXJtaW5hbCA9IEBjcmVhdGVUZXJtaW5hbFZpZXcoKVxuICAgIGVsc2UgaWYgQGFjdGl2ZVRlcm1pbmFsID09IG51bGxcbiAgICAgIEBhY3RpdmVUZXJtaW5hbCA9IEB0ZXJtaW5hbFZpZXdzWzBdXG4gICAgQGFjdGl2ZVRlcm1pbmFsLnRvZ2dsZSgpXG5cbiAgY2xlYXI6IC0+XG4gICAgQGRlc3Ryb3lBY3RpdmVUZXJtKClcbiAgICBAbmV3VGVybWluYWxWaWV3KClcblxuICBzZXRTdGF0dXNDb2xvcjogKGV2ZW50KSAtPlxuICAgIGNvbG9yID0gZXZlbnQudHlwZS5tYXRjaCgvXFx3KyQvKVswXVxuICAgIGNvbG9yID0gYXRvbS5jb25maWcuZ2V0KFwicGxhdGZvcm1pby1pZGUtdGVybWluYWwuaWNvbkNvbG9ycy4je2NvbG9yfVwiKS50b1JHQkFTdHJpbmcoKVxuICAgICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcucGlvLXRlcm1pbmFsLXN0YXR1cy1pY29uJykuY3NzICdjb2xvcicsIGNvbG9yXG5cbiAgY2xlYXJTdGF0dXNDb2xvcjogKGV2ZW50KSAtPlxuICAgICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcucGlvLXRlcm1pbmFsLXN0YXR1cy1pY29uJykuY3NzICdjb2xvcicsICcnXG5cbiAgb25EcmFnU3RhcnQ6IChldmVudCkgPT5cbiAgICBldmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC1wYW5lbCcsICd0cnVlJ1xuXG4gICAgZWxlbWVudCA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcucGlvLXRlcm1pbmFsLXN0YXR1cy1pY29uJylcbiAgICBlbGVtZW50LmFkZENsYXNzICdpcy1kcmFnZ2luZydcbiAgICBldmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICdmcm9tLWluZGV4JywgZWxlbWVudC5pbmRleCgpXG5cbiAgb25EcmFnTGVhdmU6IChldmVudCkgPT5cbiAgICBAcmVtb3ZlUGxhY2Vob2xkZXIoKVxuXG4gIG9uRHJhZ0VuZDogKGV2ZW50KSA9PlxuICAgIEBjbGVhckRyb3BUYXJnZXQoKVxuXG4gIG9uRHJhZ092ZXI6IChldmVudCkgPT5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICB1bmxlc3MgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgncGxhdGZvcm1pby1pZGUtdGVybWluYWwnKSBpcyAndHJ1ZSdcbiAgICAgIHJldHVyblxuXG4gICAgbmV3RHJvcFRhcmdldEluZGV4ID0gQGdldERyb3BUYXJnZXRJbmRleChldmVudClcbiAgICByZXR1cm4gdW5sZXNzIG5ld0Ryb3BUYXJnZXRJbmRleD9cbiAgICBAcmVtb3ZlRHJvcFRhcmdldENsYXNzZXMoKVxuICAgIHN0YXR1c0ljb25zID0gQHN0YXR1c0NvbnRhaW5lci5jaGlsZHJlbiAnLnBpby10ZXJtaW5hbC1zdGF0dXMtaWNvbidcblxuICAgIGlmIG5ld0Ryb3BUYXJnZXRJbmRleCA8IHN0YXR1c0ljb25zLmxlbmd0aFxuICAgICAgZWxlbWVudCA9IHN0YXR1c0ljb25zLmVxKG5ld0Ryb3BUYXJnZXRJbmRleCkuYWRkQ2xhc3MgJ2lzLWRyb3AtdGFyZ2V0J1xuICAgICAgQGdldFBsYWNlaG9sZGVyKCkuaW5zZXJ0QmVmb3JlKGVsZW1lbnQpXG4gICAgZWxzZVxuICAgICAgZWxlbWVudCA9IHN0YXR1c0ljb25zLmVxKG5ld0Ryb3BUYXJnZXRJbmRleCAtIDEpLmFkZENsYXNzICdkcm9wLXRhcmdldC1pcy1hZnRlcidcbiAgICAgIEBnZXRQbGFjZWhvbGRlcigpLmluc2VydEFmdGVyKGVsZW1lbnQpXG5cbiAgb25Ecm9wOiAoZXZlbnQpID0+XG4gICAge2RhdGFUcmFuc2Zlcn0gPSBldmVudC5vcmlnaW5hbEV2ZW50XG4gICAgcGFuZWxFdmVudCA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC1wYW5lbCcpIGlzICd0cnVlJ1xuICAgIHRhYkV2ZW50ID0gZGF0YVRyYW5zZmVyLmdldERhdGEoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLXRhYicpIGlzICd0cnVlJ1xuICAgIHJldHVybiB1bmxlc3MgcGFuZWxFdmVudCBvciB0YWJFdmVudFxuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICB0b0luZGV4ID0gQGdldERyb3BUYXJnZXRJbmRleChldmVudClcbiAgICBAY2xlYXJEcm9wVGFyZ2V0KClcblxuICAgIGlmIHRhYkV2ZW50XG4gICAgICBmcm9tSW5kZXggPSBwYXJzZUludChkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnc29ydGFibGUtaW5kZXgnKSlcbiAgICAgIHBhbmVJbmRleCA9IHBhcnNlSW50KGRhdGFUcmFuc2Zlci5nZXREYXRhKCdmcm9tLXBhbmUtaW5kZXgnKSlcbiAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpW3BhbmVJbmRleF1cbiAgICAgIHZpZXcgPSBwYW5lLml0ZW1BdEluZGV4KGZyb21JbmRleClcbiAgICAgIHBhbmUucmVtb3ZlSXRlbSh2aWV3LCBmYWxzZSlcbiAgICAgIHZpZXcuc2hvdygpXG5cbiAgICAgIHZpZXcudG9nZ2xlVGFiVmlldygpXG4gICAgICBAdGVybWluYWxWaWV3cy5wdXNoIHZpZXdcbiAgICAgIHZpZXcub3BlbigpIGlmIHZpZXcuc3RhdHVzSWNvbi5pc0FjdGl2ZSgpXG4gICAgICBAc3RhdHVzQ29udGFpbmVyLmFwcGVuZCB2aWV3LnN0YXR1c0ljb25cbiAgICAgIGZyb21JbmRleCA9IEB0ZXJtaW5hbFZpZXdzLmxlbmd0aCAtIDFcbiAgICBlbHNlXG4gICAgICBmcm9tSW5kZXggPSBwYXJzZUludChkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnZnJvbS1pbmRleCcpKVxuICAgIEB1cGRhdGVPcmRlcihmcm9tSW5kZXgsIHRvSW5kZXgpXG5cbiAgb25Ecm9wVGFiQmFyOiAoZXZlbnQsIHBhbmUpID0+XG4gICAge2RhdGFUcmFuc2Zlcn0gPSBldmVudC5vcmlnaW5hbEV2ZW50XG4gICAgcmV0dXJuIHVubGVzcyBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgncGxhdGZvcm1pby1pZGUtdGVybWluYWwtcGFuZWwnKSBpcyAndHJ1ZSdcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIEBjbGVhckRyb3BUYXJnZXQoKVxuXG4gICAgZnJvbUluZGV4ID0gcGFyc2VJbnQoZGF0YVRyYW5zZmVyLmdldERhdGEoJ2Zyb20taW5kZXgnKSlcbiAgICB2aWV3ID0gQHRlcm1pbmFsVmlld3NbZnJvbUluZGV4XVxuICAgIHZpZXcuY3NzIFwiaGVpZ2h0XCIsIFwiXCJcbiAgICB2aWV3LnRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gXCJcIlxuICAgIHRhYkJhciA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcudGFiLWJhcicpXG5cbiAgICB2aWV3LnRvZ2dsZVRhYlZpZXcoKVxuICAgIEByZW1vdmVUZXJtaW5hbFZpZXcgdmlld1xuICAgIEBzdGF0dXNDb250YWluZXIuY2hpbGRyZW4oKS5lcShmcm9tSW5kZXgpLmRldGFjaCgpXG4gICAgdmlldy5zdGF0dXNJY29uLnJlbW92ZVRvb2x0aXAoKVxuXG4gICAgcGFuZS5hZGRJdGVtIHZpZXcsIHBhbmUuZ2V0SXRlbXMoKS5sZW5ndGhcbiAgICBwYW5lLmFjdGl2YXRlSXRlbSB2aWV3XG5cbiAgICB2aWV3LmZvY3VzKClcblxuICBjbGVhckRyb3BUYXJnZXQ6IC0+XG4gICAgZWxlbWVudCA9IEBmaW5kKCcuaXMtZHJhZ2dpbmcnKVxuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MgJ2lzLWRyYWdnaW5nJ1xuICAgIEByZW1vdmVEcm9wVGFyZ2V0Q2xhc3NlcygpXG4gICAgQHJlbW92ZVBsYWNlaG9sZGVyKClcblxuICByZW1vdmVEcm9wVGFyZ2V0Q2xhc3NlczogLT5cbiAgICBAc3RhdHVzQ29udGFpbmVyLmZpbmQoJy5pcy1kcm9wLXRhcmdldCcpLnJlbW92ZUNsYXNzICdpcy1kcm9wLXRhcmdldCdcbiAgICBAc3RhdHVzQ29udGFpbmVyLmZpbmQoJy5kcm9wLXRhcmdldC1pcy1hZnRlcicpLnJlbW92ZUNsYXNzICdkcm9wLXRhcmdldC1pcy1hZnRlcidcblxuICBnZXREcm9wVGFyZ2V0SW5kZXg6IChldmVudCkgLT5cbiAgICB0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICByZXR1cm4gaWYgQGlzUGxhY2Vob2xkZXIodGFyZ2V0KVxuXG4gICAgc3RhdHVzSWNvbnMgPSBAc3RhdHVzQ29udGFpbmVyLmNoaWxkcmVuKCcucGlvLXRlcm1pbmFsLXN0YXR1cy1pY29uJylcbiAgICBlbGVtZW50ID0gdGFyZ2V0LmNsb3Nlc3QoJy5waW8tdGVybWluYWwtc3RhdHVzLWljb24nKVxuICAgIGVsZW1lbnQgPSBzdGF0dXNJY29ucy5sYXN0KCkgaWYgZWxlbWVudC5sZW5ndGggaXMgMFxuXG4gICAgcmV0dXJuIDAgdW5sZXNzIGVsZW1lbnQubGVuZ3RoXG5cbiAgICBlbGVtZW50Q2VudGVyID0gZWxlbWVudC5vZmZzZXQoKS5sZWZ0ICsgZWxlbWVudC53aWR0aCgpIC8gMlxuXG4gICAgaWYgZXZlbnQub3JpZ2luYWxFdmVudC5wYWdlWCA8IGVsZW1lbnRDZW50ZXJcbiAgICAgIHN0YXR1c0ljb25zLmluZGV4KGVsZW1lbnQpXG4gICAgZWxzZSBpZiBlbGVtZW50Lm5leHQoJy5waW8tdGVybWluYWwtc3RhdHVzLWljb24nKS5sZW5ndGggPiAwXG4gICAgICBzdGF0dXNJY29ucy5pbmRleChlbGVtZW50Lm5leHQoJy5waW8tdGVybWluYWwtc3RhdHVzLWljb24nKSlcbiAgICBlbHNlXG4gICAgICBzdGF0dXNJY29ucy5pbmRleChlbGVtZW50KSArIDFcblxuICBnZXRQbGFjZWhvbGRlcjogLT5cbiAgICBAcGxhY2Vob2xkZXJFbCA/PSAkKCc8bGkgY2xhc3M9XCJwbGFjZWhvbGRlclwiPjwvbGk+JylcblxuICByZW1vdmVQbGFjZWhvbGRlcjogLT5cbiAgICBAcGxhY2Vob2xkZXJFbD8ucmVtb3ZlKClcbiAgICBAcGxhY2Vob2xkZXJFbCA9IG51bGxcblxuICBpc1BsYWNlaG9sZGVyOiAoZWxlbWVudCkgLT5cbiAgICBlbGVtZW50LmlzKCcucGxhY2Vob2xkZXInKVxuXG4gIGljb25BdEluZGV4OiAoaW5kZXgpIC0+XG4gICAgQGdldFN0YXR1c0ljb25zKCkuZXEoaW5kZXgpXG5cbiAgZ2V0U3RhdHVzSWNvbnM6IC0+XG4gICAgQHN0YXR1c0NvbnRhaW5lci5jaGlsZHJlbignLnBpby10ZXJtaW5hbC1zdGF0dXMtaWNvbicpXG5cbiAgbW92ZUljb25Ub0luZGV4OiAoaWNvbiwgdG9JbmRleCkgLT5cbiAgICBmb2xsb3dpbmdJY29uID0gQGdldFN0YXR1c0ljb25zKClbdG9JbmRleF1cbiAgICBjb250YWluZXIgPSBAc3RhdHVzQ29udGFpbmVyWzBdXG4gICAgaWYgZm9sbG93aW5nSWNvbj9cbiAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoaWNvbiwgZm9sbG93aW5nSWNvbilcbiAgICBlbHNlXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaWNvbilcblxuICBtb3ZlVGVybWluYWxWaWV3OiAoZnJvbUluZGV4LCB0b0luZGV4KSA9PlxuICAgIGFjdGl2ZVRlcm1pbmFsID0gQGdldEFjdGl2ZVRlcm1pbmFsVmlldygpXG4gICAgdmlldyA9IEB0ZXJtaW5hbFZpZXdzLnNwbGljZShmcm9tSW5kZXgsIDEpWzBdXG4gICAgQHRlcm1pbmFsVmlld3Muc3BsaWNlIHRvSW5kZXgsIDAsIHZpZXdcbiAgICBAc2V0QWN0aXZlVGVybWluYWxWaWV3IGFjdGl2ZVRlcm1pbmFsXG5cbiAgdXBkYXRlT3JkZXI6IChmcm9tSW5kZXgsIHRvSW5kZXgpIC0+XG4gICAgcmV0dXJuIGlmIGZyb21JbmRleCBpcyB0b0luZGV4XG4gICAgdG9JbmRleC0tIGlmIGZyb21JbmRleCA8IHRvSW5kZXhcblxuICAgIGljb24gPSBAZ2V0U3RhdHVzSWNvbnMoKS5lcShmcm9tSW5kZXgpLmRldGFjaCgpXG4gICAgQG1vdmVJY29uVG9JbmRleCBpY29uLmdldCgwKSwgdG9JbmRleFxuICAgIEBtb3ZlVGVybWluYWxWaWV3IGZyb21JbmRleCwgdG9JbmRleFxuICAgIGljb24uYWRkQ2xhc3MgJ2luc2VydGVkJ1xuICAgIGljb24ub25lICd3ZWJraXRBbmltYXRpb25FbmQnLCAtPiBpY29uLnJlbW92ZUNsYXNzKCdpbnNlcnRlZCcpXG4iXX0=
