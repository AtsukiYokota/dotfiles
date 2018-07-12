(function() {
  var log;

  log = require('./log');

  module.exports = {
    selector: '.source.python',
    disableForSelector: '.source.python .comment, .source.python .string',
    inclusionPriority: 2,
    suggestionPriority: atom.config.get('autocomplete-python.suggestionPriority'),
    excludeLowerPriority: false,
    cacheSize: 10,
    _addEventListener: function(editor, eventName, handler) {
      var disposable, editorView;
      editorView = atom.views.getView(editor);
      editorView.addEventListener(eventName, handler);
      disposable = new this.Disposable(function() {
        log.debug('Unsubscribing from event listener ', eventName, handler);
        return editorView.removeEventListener(eventName, handler);
      });
      return disposable;
    },
    _noExecutableError: function(error) {
      if (this.providerNoExecutable) {
        return;
      }
      log.warning('No python executable found', error);
      atom.notifications.addWarning('autocomplete-python unable to find python binary.', {
        detail: "Please set path to python executable manually in package\nsettings and restart your editor. Be sure to migrate on new settings\nif everything worked on previous version.\nDetailed error message: " + error + "\n\nCurrent config: " + (atom.config.get('autocomplete-python.pythonPaths')),
        dismissable: true
      });
      return this.providerNoExecutable = true;
    },
    _spawnDaemon: function() {
      var interpreter, ref;
      interpreter = this.InterpreterLookup.getInterpreter();
      log.debug('Using interpreter', interpreter);
      this.provider = new this.BufferedProcess({
        command: interpreter || 'python',
        args: [__dirname + '/completion.py'],
        stdout: (function(_this) {
          return function(data) {
            return _this._deserialize(data);
          };
        })(this),
        stderr: (function(_this) {
          return function(data) {
            var ref, requestId, resolve, results1;
            if (data.indexOf('is not recognized as an internal or external') > -1) {
              return _this._noExecutableError(data);
            }
            log.debug("autocomplete-python traceback output: " + data);
            if (data.indexOf('jedi') > -1) {
              if (atom.config.get('autocomplete-python.outputProviderErrors')) {
                atom.notifications.addWarning('Looks like this error originated from Jedi. Please do not\nreport such issues in autocomplete-python issue tracker. Report\nthem directly to Jedi. Turn off `outputProviderErrors` setting\nto hide such errors in future. Traceback output:', {
                  detail: "" + data,
                  dismissable: true
                });
              }
            } else {
              atom.notifications.addError('autocomplete-python traceback output:', {
                detail: "" + data,
                dismissable: true
              });
            }
            log.debug("Forcing to resolve " + (Object.keys(_this.requests).length) + " promises");
            ref = _this.requests;
            results1 = [];
            for (requestId in ref) {
              resolve = ref[requestId];
              if (typeof resolve === 'function') {
                resolve([]);
              }
              results1.push(delete _this.requests[requestId]);
            }
            return results1;
          };
        })(this),
        exit: (function(_this) {
          return function(code) {
            return log.warning('Process exit with', code, _this.provider);
          };
        })(this)
      });
      this.provider.onWillThrowError((function(_this) {
        return function(arg) {
          var error, handle;
          error = arg.error, handle = arg.handle;
          if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
            _this._noExecutableError(error);
            _this.dispose();
            return handle();
          } else {
            throw error;
          }
        };
      })(this));
      if ((ref = this.provider.process) != null) {
        ref.stdin.on('error', function(err) {
          return log.debug('stdin', err);
        });
      }
      return setTimeout((function(_this) {
        return function() {
          log.debug('Killing python process after timeout...');
          if (_this.provider && _this.provider.process) {
            return _this.provider.kill();
          }
        };
      })(this), 60 * 10 * 1000);
    },
    load: function() {
      if (!this.constructed) {
        this.constructor();
      }
      return this;
    },
    constructor: function() {
      var err, ref, selector;
      ref = require('atom'), this.Disposable = ref.Disposable, this.CompositeDisposable = ref.CompositeDisposable, this.BufferedProcess = ref.BufferedProcess;
      this.selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;
      this.Selector = require('selector-kit').Selector;
      this.DefinitionsView = require('./definitions-view');
      this.UsagesView = require('./usages-view');
      this.OverrideView = require('./override-view');
      this.RenameView = require('./rename-view');
      this.InterpreterLookup = require('./interpreters-lookup');
      this._ = require('underscore');
      this.filter = require('fuzzaldrin-plus').filter;
      this._showSignatureOverlay = require('./tooltips')._showSignatureOverlay;
      this.requests = {};
      this.responses = {};
      this.provider = null;
      this.disposables = new this.CompositeDisposable;
      this.subscriptions = {};
      this.definitionsView = null;
      this.usagesView = null;
      this.renameView = null;
      this.constructed = true;
      this.snippetsManager = null;
      log.debug("Init autocomplete-python with priority " + this.suggestionPriority);
      try {
        this.triggerCompletionRegex = RegExp(atom.config.get('autocomplete-python.triggerCompletionRegex'));
      } catch (error1) {
        err = error1;
        atom.notifications.addWarning('autocomplete-python invalid regexp to trigger autocompletions.\nFalling back to default value.', {
          detail: "Original exception: " + err,
          dismissable: true
        });
        atom.config.set('autocomplete-python.triggerCompletionRegex', '([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)');
        this.triggerCompletionRegex = /([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)/;
      }
      selector = 'atom-text-editor[data-grammar~=python]';
      atom.commands.add(selector, 'autocomplete-python:go-to-definition', (function(_this) {
        return function() {
          return _this.goToDefinition();
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:complete-arguments', (function(_this) {
        return function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return _this._completeArguments(editor, editor.getCursorBufferPosition(), true);
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:show-usages', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.usagesView) {
            _this.usagesView.destroy();
          }
          _this.usagesView = new _this.UsagesView();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            return _this.usagesView.setItems(usages);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:override-method', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.overrideView) {
            _this.overrideView.destroy();
          }
          _this.overrideView = new _this.OverrideView();
          return _this.getMethods(editor, bufferPosition).then(function(arg) {
            var bufferPosition, indent, methods;
            methods = arg.methods, indent = arg.indent, bufferPosition = arg.bufferPosition;
            _this.overrideView.indent = indent;
            _this.overrideView.bufferPosition = bufferPosition;
            return _this.overrideView.setItems(methods);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:rename', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            if (_this.renameView) {
              _this.renameView.destroy();
            }
            if (usages.length > 0) {
              _this.renameView = new _this.RenameView(usages);
              return _this.renameView.onInput(function(newName) {
                var _relative, fileName, project, ref1, ref2, results1;
                ref1 = _this._.groupBy(usages, 'fileName');
                results1 = [];
                for (fileName in ref1) {
                  usages = ref1[fileName];
                  ref2 = atom.project.relativizePath(fileName), project = ref2[0], _relative = ref2[1];
                  if (project) {
                    results1.push(_this._updateUsagesInFile(fileName, usages, newName));
                  } else {
                    results1.push(log.debug('Ignoring file outside of project', fileName));
                  }
                }
                return results1;
              });
            } else {
              if (_this.usagesView) {
                _this.usagesView.destroy();
              }
              _this.usagesView = new _this.UsagesView();
              return _this.usagesView.setItems(usages);
            }
          });
        };
      })(this));
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          return editor.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(editor, grammar);
          });
        };
      })(this));
      return atom.config.onDidChange('autocomplete-plus.enableAutoActivation', (function(_this) {
        return function() {
          return atom.workspace.observeTextEditors(function(editor) {
            return _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          });
        };
      })(this));
    },
    _updateUsagesInFile: function(fileName, usages, newName) {
      var columnOffset;
      columnOffset = {};
      return atom.workspace.open(fileName, {
        activateItem: false
      }).then(function(editor) {
        var buffer, column, i, len, line, name, usage;
        buffer = editor.getBuffer();
        for (i = 0, len = usages.length; i < len; i++) {
          usage = usages[i];
          name = usage.name, line = usage.line, column = usage.column;
          if (columnOffset[line] == null) {
            columnOffset[line] = 0;
          }
          log.debug('Replacing', usage, 'with', newName, 'in', editor.id);
          log.debug('Offset for line', line, 'is', columnOffset[line]);
          buffer.setTextInRange([[line - 1, column + columnOffset[line]], [line - 1, column + name.length + columnOffset[line]]], newName);
          columnOffset[line] += newName.length - name.length;
        }
        return buffer.save();
      });
    },
    _handleGrammarChangeEvent: function(editor, grammar) {
      var disposable, eventId, eventName;
      eventName = 'keyup';
      eventId = editor.id + "." + eventName;
      if (grammar.scopeName === 'source.python') {
        if (atom.config.get('autocomplete-python.showTooltips') === true) {
          editor.onDidChangeCursorPosition((function(_this) {
            return function(event) {
              return _this._showSignatureOverlay(event, _this);
            };
          })(this));
        }
        if (!atom.config.get('autocomplete-plus.enableAutoActivation')) {
          log.debug('Ignoring keyup events due to autocomplete-plus settings.');
          return;
        }
        disposable = this._addEventListener(editor, eventName, (function(_this) {
          return function(e) {
            if (atom.keymaps.keystrokeForKeyboardEvent(e) === '^(') {
              log.debug('Trying to complete arguments on keyup event', e);
              return _this._completeArguments(editor, editor.getCursorBufferPosition());
            }
          };
        })(this));
        this.disposables.add(disposable);
        this.subscriptions[eventId] = disposable;
        return log.debug('Subscribed on event', eventId);
      } else {
        if (eventId in this.subscriptions) {
          this.subscriptions[eventId].dispose();
          return log.debug('Unsubscribed from event', eventId);
        }
      }
    },
    _serialize: function(request) {
      log.debug('Serializing request to be sent to Jedi', request);
      return JSON.stringify(request);
    },
    _sendRequest: function(data, respawned) {
      var process;
      log.debug('Pending requests:', Object.keys(this.requests).length, this.requests);
      if (Object.keys(this.requests).length > 10) {
        log.debug('Cleaning up request queue to avoid overflow, ignoring request');
        this.requests = {};
        if (this.provider && this.provider.process) {
          log.debug('Killing python process');
          this.provider.kill();
          return;
        }
      }
      if (this.provider && this.provider.process) {
        process = this.provider.process;
        if (process.exitCode === null && process.signalCode === null) {
          if (this.provider.process.pid) {
            return this.provider.process.stdin.write(data + '\n');
          } else {
            return log.debug('Attempt to communicate with terminated process', this.provider);
          }
        } else if (respawned) {
          atom.notifications.addWarning(["Failed to spawn daemon for autocomplete-python.", "Completions will not work anymore", "unless you restart your editor."].join(' '), {
            detail: ["exitCode: " + process.exitCode, "signalCode: " + process.signalCode].join('\n'),
            dismissable: true
          });
          return this.dispose();
        } else {
          this._spawnDaemon();
          this._sendRequest(data, {
            respawned: true
          });
          return log.debug('Re-spawning python process...');
        }
      } else {
        log.debug('Spawning python process...');
        this._spawnDaemon();
        return this._sendRequest(data);
      }
    },
    _deserialize: function(response) {
      var bufferPosition, cacheSizeDelta, e, editor, i, id, ids, j, len, len1, ref, ref1, ref2, resolve, responseSource, results1;
      log.debug('Deserealizing response from Jedi', response);
      log.debug("Got " + (response.trim().split('\n').length) + " lines");
      ref = response.trim().split('\n');
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        responseSource = ref[i];
        try {
          response = JSON.parse(responseSource);
        } catch (error1) {
          e = error1;
          throw new Error("Failed to parse JSON from \"" + responseSource + "\".\nOriginal exception: " + e);
        }
        if (response['arguments']) {
          editor = this.requests[response['id']];
          if (typeof editor === 'object') {
            bufferPosition = editor.getCursorBufferPosition();
            if (response['id'] === this._generateRequestId('arguments', editor, bufferPosition)) {
              if ((ref1 = this.snippetsManager) != null) {
                ref1.insertSnippet(response['arguments'], editor);
              }
            }
          }
        } else {
          resolve = this.requests[response['id']];
          if (typeof resolve === 'function') {
            resolve(response['results']);
          }
        }
        cacheSizeDelta = Object.keys(this.responses).length > this.cacheSize;
        if (cacheSizeDelta > 0) {
          ids = Object.keys(this.responses).sort((function(_this) {
            return function(a, b) {
              return _this.responses[a]['timestamp'] - _this.responses[b]['timestamp'];
            };
          })(this));
          ref2 = ids.slice(0, cacheSizeDelta);
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            id = ref2[j];
            log.debug('Removing old item from cache with ID', id);
            delete this.responses[id];
          }
        }
        this.responses[response['id']] = {
          source: responseSource,
          timestamp: Date.now()
        };
        log.debug('Cached request with ID', response['id']);
        results1.push(delete this.requests[response['id']]);
      }
      return results1;
    },
    _generateRequestId: function(type, editor, bufferPosition, text) {
      if (!text) {
        text = editor.getText();
      }
      return require('crypto').createHash('md5').update([editor.getPath(), text, bufferPosition.row, bufferPosition.column, type].join()).digest('hex');
    },
    _generateRequestConfig: function() {
      var args, extraPaths;
      extraPaths = this.InterpreterLookup.applySubstitutions(atom.config.get('autocomplete-python.extraPaths').split(';'));
      args = {
        'extraPaths': extraPaths,
        'useSnippets': atom.config.get('autocomplete-python.useSnippets'),
        'caseInsensitiveCompletion': atom.config.get('autocomplete-python.caseInsensitiveCompletion'),
        'showDescriptions': atom.config.get('autocomplete-python.showDescriptions'),
        'fuzzyMatcher': atom.config.get('autocomplete-python.fuzzyMatcher')
      };
      return args;
    },
    setSnippetsManager: function(snippetsManager) {
      this.snippetsManager = snippetsManager;
    },
    _completeArguments: function(editor, bufferPosition, force) {
      var disableForSelector, line, lines, payload, prefix, scopeChain, scopeDescriptor, suffix, useSnippets;
      useSnippets = atom.config.get('autocomplete-python.useSnippets');
      if (!force && useSnippets === 'none') {
        atom.commands.dispatch(document.querySelector('atom-text-editor'), 'autocomplete-plus:activate');
        return;
      }
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = this.Selector.create(this.disableForSelector);
      if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('Ignoring argument completion inside of', scopeChain);
        return;
      }
      lines = editor.getBuffer().getLines();
      line = lines[bufferPosition.row];
      prefix = line.slice(bufferPosition.column - 1, bufferPosition.column);
      if (prefix !== '(') {
        log.debug('Ignoring argument completion with prefix', prefix);
        return;
      }
      suffix = line.slice(bufferPosition.column, line.length);
      if (!/^(\)(?:$|\s)|\s|$)/.test(suffix)) {
        log.debug('Ignoring argument completion with suffix', suffix);
        return;
      }
      payload = {
        id: this._generateRequestId('arguments', editor, bufferPosition),
        lookup: 'arguments',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function() {
          return _this.requests[payload.id] = editor;
        };
      })(this));
    },
    _fuzzyFilter: function(candidates, query) {
      if (candidates.length !== 0 && (query !== ' ' && query !== '.' && query !== '(')) {
        candidates = this.filter(candidates, query, {
          key: 'text'
        });
      }
      return candidates;
    },
    getSuggestions: function(arg) {
      var bufferPosition, editor, lastIdentifier, line, lines, matches, payload, prefix, requestId, scopeDescriptor;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      this.load();
      if (!this.triggerCompletionRegex.test(prefix)) {
        return this.lastSuggestions = [];
      }
      bufferPosition = {
        row: bufferPosition.row,
        column: bufferPosition.column
      };
      lines = editor.getBuffer().getLines();
      if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
        line = lines[bufferPosition.row];
        lastIdentifier = /\.?[a-zA-Z_][a-zA-Z0-9_]*$/.exec(line.slice(0, bufferPosition.column));
        if (lastIdentifier) {
          bufferPosition.column = lastIdentifier.index + 1;
          lines[bufferPosition.row] = line.slice(0, bufferPosition.column);
        }
      }
      requestId = this._generateRequestId('completions', editor, bufferPosition, lines.join('\n'));
      if (requestId in this.responses) {
        log.debug('Using cached response with ID', requestId);
        matches = JSON.parse(this.responses[requestId]['source'])['results'];
        if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
          return this.lastSuggestions = this._fuzzyFilter(matches, prefix);
        } else {
          return this.lastSuggestions = matches;
        }
      }
      payload = {
        id: requestId,
        prefix: prefix,
        lookup: 'completions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
            return _this.requests[payload.id] = function(matches) {
              return resolve(_this.lastSuggestions = _this._fuzzyFilter(matches, prefix));
            };
          } else {
            return _this.requests[payload.id] = function(suggestions) {
              return resolve(_this.lastSuggestions = suggestions);
            };
          }
        };
      })(this));
    },
    getDefinitions: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('definitions', editor, bufferPosition),
        lookup: 'definitions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getUsages: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('usages', editor, bufferPosition),
        lookup: 'usages',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getMethods: function(editor, bufferPosition) {
      var indent, lines, payload;
      indent = bufferPosition.column;
      lines = editor.getBuffer().getLines();
      lines.splice(bufferPosition.row + 1, 0, "  def __autocomplete_python(s):");
      lines.splice(bufferPosition.row + 2, 0, "    s.");
      payload = {
        id: this._generateRequestId('methods', editor, bufferPosition),
        lookup: 'methods',
        path: editor.getPath(),
        source: lines.join('\n'),
        line: bufferPosition.row + 2,
        column: 6,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = function(methods) {
            return resolve({
              methods: methods,
              indent: indent,
              bufferPosition: bufferPosition
            });
          };
        };
      })(this));
    },
    goToDefinition: function(editor, bufferPosition) {
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      if (!bufferPosition) {
        bufferPosition = editor.getCursorBufferPosition();
      }
      if (this.definitionsView) {
        this.definitionsView.destroy();
      }
      this.definitionsView = new this.DefinitionsView();
      return this.getDefinitions(editor, bufferPosition).then((function(_this) {
        return function(results) {
          _this.definitionsView.setItems(results);
          if (results.length === 1) {
            return _this.definitionsView.confirmed(results[0]);
          }
        };
      })(this));
    },
    dispose: function() {
      if (this.disposables) {
        this.disposables.dispose();
      }
      if (this.provider) {
        return this.provider.kill();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL3Byb3ZpZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSOztFQUVOLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsZ0JBQVY7SUFDQSxrQkFBQSxFQUFvQixpREFEcEI7SUFFQSxpQkFBQSxFQUFtQixDQUZuQjtJQUdBLGtCQUFBLEVBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsQ0FIcEI7SUFJQSxvQkFBQSxFQUFzQixLQUp0QjtJQUtBLFNBQUEsRUFBVyxFQUxYO0lBT0EsaUJBQUEsRUFBbUIsU0FBQyxNQUFELEVBQVMsU0FBVCxFQUFvQixPQUFwQjtBQUNqQixVQUFBO01BQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQjtNQUNiLFVBQVUsQ0FBQyxnQkFBWCxDQUE0QixTQUE1QixFQUF1QyxPQUF2QztNQUNBLFVBQUEsR0FBYSxJQUFJLElBQUMsQ0FBQSxVQUFMLENBQWdCLFNBQUE7UUFDM0IsR0FBRyxDQUFDLEtBQUosQ0FBVSxvQ0FBVixFQUFnRCxTQUFoRCxFQUEyRCxPQUEzRDtlQUNBLFVBQVUsQ0FBQyxtQkFBWCxDQUErQixTQUEvQixFQUEwQyxPQUExQztNQUYyQixDQUFoQjtBQUdiLGFBQU87SUFOVSxDQVBuQjtJQWVBLGtCQUFBLEVBQW9CLFNBQUMsS0FBRDtNQUNsQixJQUFHLElBQUMsQ0FBQSxvQkFBSjtBQUNFLGVBREY7O01BRUEsR0FBRyxDQUFDLE9BQUosQ0FBWSw0QkFBWixFQUEwQyxLQUExQztNQUNBLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FDRSxtREFERixFQUN1RDtRQUNyRCxNQUFBLEVBQVEscU1B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QUFELEdBQW1CLElBQUksSUFBQyxDQUFBLGVBQUwsQ0FBQTthQUNuQixJQUFDLENBQUEsY0FBRCxDQUFnQixNQUFoQixFQUF3QixjQUF4QixDQUF1QyxDQUFDLElBQXhDLENBQTZDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO1VBQzNDLEtBQUMsQ0FBQSxlQUFlLENBQUMsUUFBakIsQ0FBMEIsT0FBMUI7VUFDQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEtBQWtCLENBQXJCO21CQUNFLEtBQUMsQ0FBQSxlQUFlLENBQUMsU0FBakIsQ0FBMkIsT0FBUSxDQUFBLENBQUEsQ0FBbkMsRUFERjs7UUFGMkM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdDO0lBUmMsQ0F0Y2hCO0lBbWRBLE9BQUEsRUFBUyxTQUFBO01BQ1AsSUFBRyxJQUFDLENBQUEsV0FBSjtRQUNFLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBLEVBREY7O01BRUEsSUFBRyxJQUFDLENBQUEsUUFBSjtlQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFBLEVBREY7O0lBSE8sQ0FuZFQ7O0FBSEYiLCJzb3VyY2VzQ29udGVudCI6WyJsb2cgPSByZXF1aXJlICcuL2xvZydcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzZWxlY3RvcjogJy5zb3VyY2UucHl0aG9uJ1xuICBkaXNhYmxlRm9yU2VsZWN0b3I6ICcuc291cmNlLnB5dGhvbiAuY29tbWVudCwgLnNvdXJjZS5weXRob24gLnN0cmluZydcbiAgaW5jbHVzaW9uUHJpb3JpdHk6IDJcbiAgc3VnZ2VzdGlvblByaW9yaXR5OiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uc3VnZ2VzdGlvblByaW9yaXR5JylcbiAgZXhjbHVkZUxvd2VyUHJpb3JpdHk6IGZhbHNlXG4gIGNhY2hlU2l6ZTogMTBcblxuICBfYWRkRXZlbnRMaXN0ZW5lcjogKGVkaXRvciwgZXZlbnROYW1lLCBoYW5kbGVyKSAtPlxuICAgIGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcgZWRpdG9yXG4gICAgZWRpdG9yVmlldy5hZGRFdmVudExpc3RlbmVyIGV2ZW50TmFtZSwgaGFuZGxlclxuICAgIGRpc3Bvc2FibGUgPSBuZXcgQERpc3Bvc2FibGUgLT5cbiAgICAgIGxvZy5kZWJ1ZyAnVW5zdWJzY3JpYmluZyBmcm9tIGV2ZW50IGxpc3RlbmVyICcsIGV2ZW50TmFtZSwgaGFuZGxlclxuICAgICAgZWRpdG9yVmlldy5yZW1vdmVFdmVudExpc3RlbmVyIGV2ZW50TmFtZSwgaGFuZGxlclxuICAgIHJldHVybiBkaXNwb3NhYmxlXG5cbiAgX25vRXhlY3V0YWJsZUVycm9yOiAoZXJyb3IpIC0+XG4gICAgaWYgQHByb3ZpZGVyTm9FeGVjdXRhYmxlXG4gICAgICByZXR1cm5cbiAgICBsb2cud2FybmluZyAnTm8gcHl0aG9uIGV4ZWN1dGFibGUgZm91bmQnLCBlcnJvclxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgJ2F1dG9jb21wbGV0ZS1weXRob24gdW5hYmxlIHRvIGZpbmQgcHl0aG9uIGJpbmFyeS4nLCB7XG4gICAgICBkZXRhaWw6IFwiXCJcIlBsZWFzZSBzZXQgcGF0aCB0byBweXRob24gZXhlY3V0YWJsZSBtYW51YWxseSBpbiBwYWNrYWdlXG4gICAgICBzZXR0aW5ncyBhbmQgcmVzdGFydCB5b3VyIGVkaXRvci4gQmUgc3VyZSB0byBtaWdyYXRlIG9uIG5ldyBzZXR0aW5nc1xuICAgICAgaWYgZXZlcnl0aGluZyB3b3JrZWQgb24gcHJldmlvdXMgdmVyc2lvbi5cbiAgICAgIERldGFpbGVkIGVycm9yIG1lc3NhZ2U6ICN7ZXJyb3J9XG5cbiAgICAgIEN1cnJlbnQgY29uZmlnOiAje2F0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5weXRob25QYXRocycpfVwiXCJcIlxuICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxuICAgIEBwcm92aWRlck5vRXhlY3V0YWJsZSA9IHRydWVcblxuICBfc3Bhd25EYWVtb246IC0+XG4gICAgaW50ZXJwcmV0ZXIgPSBASW50ZXJwcmV0ZXJMb29rdXAuZ2V0SW50ZXJwcmV0ZXIoKVxuICAgIGxvZy5kZWJ1ZyAnVXNpbmcgaW50ZXJwcmV0ZXInLCBpbnRlcnByZXRlclxuICAgIEBwcm92aWRlciA9IG5ldyBAQnVmZmVyZWRQcm9jZXNzXG4gICAgICBjb21tYW5kOiBpbnRlcnByZXRlciBvciAncHl0aG9uJ1xuICAgICAgYXJnczogW19fZGlybmFtZSArICcvY29tcGxldGlvbi5weSddXG4gICAgICBzdGRvdXQ6IChkYXRhKSA9PlxuICAgICAgICBAX2Rlc2VyaWFsaXplKGRhdGEpXG4gICAgICBzdGRlcnI6IChkYXRhKSA9PlxuICAgICAgICBpZiBkYXRhLmluZGV4T2YoJ2lzIG5vdCByZWNvZ25pemVkIGFzIGFuIGludGVybmFsIG9yIGV4dGVybmFsJykgPiAtMVxuICAgICAgICAgIHJldHVybiBAX25vRXhlY3V0YWJsZUVycm9yKGRhdGEpXG4gICAgICAgIGxvZy5kZWJ1ZyBcImF1dG9jb21wbGV0ZS1weXRob24gdHJhY2ViYWNrIG91dHB1dDogI3tkYXRhfVwiXG4gICAgICAgIGlmIGRhdGEuaW5kZXhPZignamVkaScpID4gLTFcbiAgICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24ub3V0cHV0UHJvdmlkZXJFcnJvcnMnKVxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICAgICAgICcnJ0xvb2tzIGxpa2UgdGhpcyBlcnJvciBvcmlnaW5hdGVkIGZyb20gSmVkaS4gUGxlYXNlIGRvIG5vdFxuICAgICAgICAgICAgICByZXBvcnQgc3VjaCBpc3N1ZXMgaW4gYXV0b2NvbXBsZXRlLXB5dGhvbiBpc3N1ZSB0cmFja2VyLiBSZXBvcnRcbiAgICAgICAgICAgICAgdGhlbSBkaXJlY3RseSB0byBKZWRpLiBUdXJuIG9mZiBgb3V0cHV0UHJvdmlkZXJFcnJvcnNgIHNldHRpbmdcbiAgICAgICAgICAgICAgdG8gaGlkZSBzdWNoIGVycm9ycyBpbiBmdXR1cmUuIFRyYWNlYmFjayBvdXRwdXQ6JycnLCB7XG4gICAgICAgICAgICAgIGRldGFpbDogXCIje2RhdGF9XCIsXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlfSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uIHRyYWNlYmFjayBvdXRwdXQ6Jywge1xuICAgICAgICAgICAgICBkZXRhaWw6IFwiI3tkYXRhfVwiLFxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG5cbiAgICAgICAgbG9nLmRlYnVnIFwiRm9yY2luZyB0byByZXNvbHZlICN7T2JqZWN0LmtleXMoQHJlcXVlc3RzKS5sZW5ndGh9IHByb21pc2VzXCJcbiAgICAgICAgZm9yIHJlcXVlc3RJZCwgcmVzb2x2ZSBvZiBAcmVxdWVzdHNcbiAgICAgICAgICBpZiB0eXBlb2YgcmVzb2x2ZSA9PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICByZXNvbHZlKFtdKVxuICAgICAgICAgIGRlbGV0ZSBAcmVxdWVzdHNbcmVxdWVzdElkXVxuXG4gICAgICBleGl0OiAoY29kZSkgPT5cbiAgICAgICAgbG9nLndhcm5pbmcgJ1Byb2Nlc3MgZXhpdCB3aXRoJywgY29kZSwgQHByb3ZpZGVyXG4gICAgQHByb3ZpZGVyLm9uV2lsbFRocm93RXJyb3IgKHtlcnJvciwgaGFuZGxlfSkgPT5cbiAgICAgIGlmIGVycm9yLmNvZGUgaXMgJ0VOT0VOVCcgYW5kIGVycm9yLnN5c2NhbGwuaW5kZXhPZignc3Bhd24nKSBpcyAwXG4gICAgICAgIEBfbm9FeGVjdXRhYmxlRXJyb3IoZXJyb3IpXG4gICAgICAgIEBkaXNwb3NlKClcbiAgICAgICAgaGFuZGxlKClcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgZXJyb3JcblxuICAgIEBwcm92aWRlci5wcm9jZXNzPy5zdGRpbi5vbiAnZXJyb3InLCAoZXJyKSAtPlxuICAgICAgbG9nLmRlYnVnICdzdGRpbicsIGVyclxuXG4gICAgc2V0VGltZW91dCA9PlxuICAgICAgbG9nLmRlYnVnICdLaWxsaW5nIHB5dGhvbiBwcm9jZXNzIGFmdGVyIHRpbWVvdXQuLi4nXG4gICAgICBpZiBAcHJvdmlkZXIgYW5kIEBwcm92aWRlci5wcm9jZXNzXG4gICAgICAgIEBwcm92aWRlci5raWxsKClcbiAgICAsIDYwICogMTAgKiAxMDAwXG5cbiAgbG9hZDogLT5cbiAgICBpZiBub3QgQGNvbnN0cnVjdGVkXG4gICAgICBAY29uc3RydWN0b3IoKVxuICAgIHJldHVybiB0aGlzXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAge0BEaXNwb3NhYmxlLCBAQ29tcG9zaXRlRGlzcG9zYWJsZSwgQEJ1ZmZlcmVkUHJvY2Vzc30gPSByZXF1aXJlICdhdG9tJ1xuICAgIHtAc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWlufSA9IHJlcXVpcmUgJy4vc2NvcGUtaGVscGVycydcbiAgICB7QFNlbGVjdG9yfSA9IHJlcXVpcmUgJ3NlbGVjdG9yLWtpdCdcbiAgICBARGVmaW5pdGlvbnNWaWV3ID0gcmVxdWlyZSAnLi9kZWZpbml0aW9ucy12aWV3J1xuICAgIEBVc2FnZXNWaWV3ID0gcmVxdWlyZSAnLi91c2FnZXMtdmlldydcbiAgICBAT3ZlcnJpZGVWaWV3ID0gcmVxdWlyZSAnLi9vdmVycmlkZS12aWV3J1xuICAgIEBSZW5hbWVWaWV3ID0gcmVxdWlyZSAnLi9yZW5hbWUtdmlldydcbiAgICBASW50ZXJwcmV0ZXJMb29rdXAgPSByZXF1aXJlICcuL2ludGVycHJldGVycy1sb29rdXAnXG4gICAgQF8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xuICAgIEBmaWx0ZXIgPSByZXF1aXJlKCdmdXp6YWxkcmluLXBsdXMnKS5maWx0ZXJcbiAgICB7QF9zaG93U2lnbmF0dXJlT3ZlcmxheX0gPSByZXF1aXJlICcuL3Rvb2x0aXBzJ1xuXG4gICAgQHJlcXVlc3RzID0ge31cbiAgICBAcmVzcG9uc2VzID0ge31cbiAgICBAcHJvdmlkZXIgPSBudWxsXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IEBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSB7fVxuICAgIEBkZWZpbml0aW9uc1ZpZXcgPSBudWxsXG4gICAgQHVzYWdlc1ZpZXcgPSBudWxsXG4gICAgQHJlbmFtZVZpZXcgPSBudWxsXG4gICAgQGNvbnN0cnVjdGVkID0gdHJ1ZVxuICAgIEBzbmlwcGV0c01hbmFnZXIgPSBudWxsXG5cbiAgICBsb2cuZGVidWcgXCJJbml0IGF1dG9jb21wbGV0ZS1weXRob24gd2l0aCBwcmlvcml0eSAje0BzdWdnZXN0aW9uUHJpb3JpdHl9XCJcblxuICAgIHRyeVxuICAgICAgQHRyaWdnZXJDb21wbGV0aW9uUmVnZXggPSBSZWdFeHAgYXRvbS5jb25maWcuZ2V0KFxuICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbi50cmlnZ2VyQ29tcGxldGlvblJlZ2V4JylcbiAgICBjYXRjaCBlcnJcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAnJydhdXRvY29tcGxldGUtcHl0aG9uIGludmFsaWQgcmVnZXhwIHRvIHRyaWdnZXIgYXV0b2NvbXBsZXRpb25zLlxuICAgICAgICBGYWxsaW5nIGJhY2sgdG8gZGVmYXVsdCB2YWx1ZS4nJycsIHtcbiAgICAgICAgZGV0YWlsOiBcIk9yaWdpbmFsIGV4Y2VwdGlvbjogI3tlcnJ9XCJcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnRyaWdnZXJDb21wbGV0aW9uUmVnZXgnLFxuICAgICAgICAgICAgICAgICAgICAgICcoW1xcLlxcIF18W2EtekEtWl9dW2EtekEtWjAtOV9dKiknKVxuICAgICAgQHRyaWdnZXJDb21wbGV0aW9uUmVnZXggPSAvKFtcXC5cXCBdfFthLXpBLVpfXVthLXpBLVowLTlfXSopL1xuXG4gICAgc2VsZWN0b3IgPSAnYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXJ+PXB5dGhvbl0nXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgc2VsZWN0b3IsICdhdXRvY29tcGxldGUtcHl0aG9uOmdvLXRvLWRlZmluaXRpb24nLCA9PlxuICAgICAgQGdvVG9EZWZpbml0aW9uKClcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246Y29tcGxldGUtYXJndW1lbnRzJywgPT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgQF9jb21wbGV0ZUFyZ3VtZW50cyhlZGl0b3IsIGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLCB0cnVlKVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgc2VsZWN0b3IsICdhdXRvY29tcGxldGUtcHl0aG9uOnNob3ctdXNhZ2VzJywgPT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgQHVzYWdlc1ZpZXdcbiAgICAgICAgQHVzYWdlc1ZpZXcuZGVzdHJveSgpXG4gICAgICBAdXNhZ2VzVmlldyA9IG5ldyBAVXNhZ2VzVmlldygpXG4gICAgICBAZ2V0VXNhZ2VzKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pLnRoZW4gKHVzYWdlcykgPT5cbiAgICAgICAgQHVzYWdlc1ZpZXcuc2V0SXRlbXModXNhZ2VzKVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgc2VsZWN0b3IsICdhdXRvY29tcGxldGUtcHl0aG9uOm92ZXJyaWRlLW1ldGhvZCcsID0+XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmIEBvdmVycmlkZVZpZXdcbiAgICAgICAgQG92ZXJyaWRlVmlldy5kZXN0cm95KClcbiAgICAgIEBvdmVycmlkZVZpZXcgPSBuZXcgQE92ZXJyaWRlVmlldygpXG4gICAgICBAZ2V0TWV0aG9kcyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKS50aGVuICh7bWV0aG9kcywgaW5kZW50LCBidWZmZXJQb3NpdGlvbn0pID0+XG4gICAgICAgIEBvdmVycmlkZVZpZXcuaW5kZW50ID0gaW5kZW50XG4gICAgICAgIEBvdmVycmlkZVZpZXcuYnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvblxuICAgICAgICBAb3ZlcnJpZGVWaWV3LnNldEl0ZW1zKG1ldGhvZHMpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246cmVuYW1lJywgPT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgQGdldFVzYWdlcyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKS50aGVuICh1c2FnZXMpID0+XG4gICAgICAgIGlmIEByZW5hbWVWaWV3XG4gICAgICAgICAgQHJlbmFtZVZpZXcuZGVzdHJveSgpXG4gICAgICAgIGlmIHVzYWdlcy5sZW5ndGggPiAwXG4gICAgICAgICAgQHJlbmFtZVZpZXcgPSBuZXcgQFJlbmFtZVZpZXcodXNhZ2VzKVxuICAgICAgICAgIEByZW5hbWVWaWV3Lm9uSW5wdXQgKG5ld05hbWUpID0+XG4gICAgICAgICAgICBmb3IgZmlsZU5hbWUsIHVzYWdlcyBvZiBAXy5ncm91cEJ5KHVzYWdlcywgJ2ZpbGVOYW1lJylcbiAgICAgICAgICAgICAgW3Byb2plY3QsIF9yZWxhdGl2ZV0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZU5hbWUpXG4gICAgICAgICAgICAgIGlmIHByb2plY3RcbiAgICAgICAgICAgICAgICBAX3VwZGF0ZVVzYWdlc0luRmlsZShmaWxlTmFtZSwgdXNhZ2VzLCBuZXdOYW1lKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBmaWxlIG91dHNpZGUgb2YgcHJvamVjdCcsIGZpbGVOYW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpZiBAdXNhZ2VzVmlld1xuICAgICAgICAgICAgQHVzYWdlc1ZpZXcuZGVzdHJveSgpXG4gICAgICAgICAgQHVzYWdlc1ZpZXcgPSBuZXcgQFVzYWdlc1ZpZXcoKVxuICAgICAgICAgIEB1c2FnZXNWaWV3LnNldEl0ZW1zKHVzYWdlcylcblxuICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZWRpdG9yLCBlZGl0b3IuZ2V0R3JhbW1hcigpKVxuICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlR3JhbW1hciAoZ3JhbW1hcikgPT5cbiAgICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZWRpdG9yLCBncmFtbWFyKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJywgPT5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChlZGl0b3IsIGVkaXRvci5nZXRHcmFtbWFyKCkpXG5cbiAgX3VwZGF0ZVVzYWdlc0luRmlsZTogKGZpbGVOYW1lLCB1c2FnZXMsIG5ld05hbWUpIC0+XG4gICAgY29sdW1uT2Zmc2V0ID0ge31cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVOYW1lLCBhY3RpdmF0ZUl0ZW06IGZhbHNlKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICAgIGZvciB1c2FnZSBpbiB1c2FnZXNcbiAgICAgICAge25hbWUsIGxpbmUsIGNvbHVtbn0gPSB1c2FnZVxuICAgICAgICBjb2x1bW5PZmZzZXRbbGluZV0gPz0gMFxuICAgICAgICBsb2cuZGVidWcgJ1JlcGxhY2luZycsIHVzYWdlLCAnd2l0aCcsIG5ld05hbWUsICdpbicsIGVkaXRvci5pZFxuICAgICAgICBsb2cuZGVidWcgJ09mZnNldCBmb3IgbGluZScsIGxpbmUsICdpcycsIGNvbHVtbk9mZnNldFtsaW5lXVxuICAgICAgICBidWZmZXIuc2V0VGV4dEluUmFuZ2UoW1xuICAgICAgICAgIFtsaW5lIC0gMSwgY29sdW1uICsgY29sdW1uT2Zmc2V0W2xpbmVdXSxcbiAgICAgICAgICBbbGluZSAtIDEsIGNvbHVtbiArIG5hbWUubGVuZ3RoICsgY29sdW1uT2Zmc2V0W2xpbmVdXSxcbiAgICAgICAgICBdLCBuZXdOYW1lKVxuICAgICAgICBjb2x1bW5PZmZzZXRbbGluZV0gKz0gbmV3TmFtZS5sZW5ndGggLSBuYW1lLmxlbmd0aFxuICAgICAgYnVmZmVyLnNhdmUoKVxuXG5cbiAgX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudDogKGVkaXRvciwgZ3JhbW1hcikgLT5cbiAgICBldmVudE5hbWUgPSAna2V5dXAnXG4gICAgZXZlbnRJZCA9IFwiI3tlZGl0b3IuaWR9LiN7ZXZlbnROYW1lfVwiXG4gICAgaWYgZ3JhbW1hci5zY29wZU5hbWUgPT0gJ3NvdXJjZS5weXRob24nXG5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5zaG93VG9vbHRpcHMnKSBpcyB0cnVlXG4gICAgICAgIGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uIChldmVudCkgPT5cbiAgICAgICAgICBAX3Nob3dTaWduYXR1cmVPdmVybGF5KGV2ZW50LCBAKVxuXG4gICAgICBpZiBub3QgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVBdXRvQWN0aXZhdGlvbicpXG4gICAgICAgIGxvZy5kZWJ1ZyAnSWdub3Jpbmcga2V5dXAgZXZlbnRzIGR1ZSB0byBhdXRvY29tcGxldGUtcGx1cyBzZXR0aW5ncy4nXG4gICAgICAgIHJldHVyblxuICAgICAgZGlzcG9zYWJsZSA9IEBfYWRkRXZlbnRMaXN0ZW5lciBlZGl0b3IsIGV2ZW50TmFtZSwgKGUpID0+XG4gICAgICAgIGlmIGF0b20ua2V5bWFwcy5rZXlzdHJva2VGb3JLZXlib2FyZEV2ZW50KGUpID09ICdeKCdcbiAgICAgICAgICBsb2cuZGVidWcgJ1RyeWluZyB0byBjb21wbGV0ZSBhcmd1bWVudHMgb24ga2V5dXAgZXZlbnQnLCBlXG4gICAgICAgICAgQF9jb21wbGV0ZUFyZ3VtZW50cyhlZGl0b3IsIGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlXG4gICAgICBAc3Vic2NyaXB0aW9uc1tldmVudElkXSA9IGRpc3Bvc2FibGVcbiAgICAgIGxvZy5kZWJ1ZyAnU3Vic2NyaWJlZCBvbiBldmVudCcsIGV2ZW50SWRcbiAgICBlbHNlXG4gICAgICBpZiBldmVudElkIG9mIEBzdWJzY3JpcHRpb25zXG4gICAgICAgIEBzdWJzY3JpcHRpb25zW2V2ZW50SWRdLmRpc3Bvc2UoKVxuICAgICAgICBsb2cuZGVidWcgJ1Vuc3Vic2NyaWJlZCBmcm9tIGV2ZW50JywgZXZlbnRJZFxuXG4gIF9zZXJpYWxpemU6IChyZXF1ZXN0KSAtPlxuICAgIGxvZy5kZWJ1ZyAnU2VyaWFsaXppbmcgcmVxdWVzdCB0byBiZSBzZW50IHRvIEplZGknLCByZXF1ZXN0XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpXG5cbiAgX3NlbmRSZXF1ZXN0OiAoZGF0YSwgcmVzcGF3bmVkKSAtPlxuICAgIGxvZy5kZWJ1ZyAnUGVuZGluZyByZXF1ZXN0czonLCBPYmplY3Qua2V5cyhAcmVxdWVzdHMpLmxlbmd0aCwgQHJlcXVlc3RzXG4gICAgaWYgT2JqZWN0LmtleXMoQHJlcXVlc3RzKS5sZW5ndGggPiAxMFxuICAgICAgbG9nLmRlYnVnICdDbGVhbmluZyB1cCByZXF1ZXN0IHF1ZXVlIHRvIGF2b2lkIG92ZXJmbG93LCBpZ25vcmluZyByZXF1ZXN0J1xuICAgICAgQHJlcXVlc3RzID0ge31cbiAgICAgIGlmIEBwcm92aWRlciBhbmQgQHByb3ZpZGVyLnByb2Nlc3NcbiAgICAgICAgbG9nLmRlYnVnICdLaWxsaW5nIHB5dGhvbiBwcm9jZXNzJ1xuICAgICAgICBAcHJvdmlkZXIua2lsbCgpXG4gICAgICAgIHJldHVyblxuXG4gICAgaWYgQHByb3ZpZGVyIGFuZCBAcHJvdmlkZXIucHJvY2Vzc1xuICAgICAgcHJvY2VzcyA9IEBwcm92aWRlci5wcm9jZXNzXG4gICAgICBpZiBwcm9jZXNzLmV4aXRDb2RlID09IG51bGwgYW5kIHByb2Nlc3Muc2lnbmFsQ29kZSA9PSBudWxsXG4gICAgICAgIGlmIEBwcm92aWRlci5wcm9jZXNzLnBpZFxuICAgICAgICAgIHJldHVybiBAcHJvdmlkZXIucHJvY2Vzcy5zdGRpbi53cml0ZShkYXRhICsgJ1xcbicpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBsb2cuZGVidWcgJ0F0dGVtcHQgdG8gY29tbXVuaWNhdGUgd2l0aCB0ZXJtaW5hdGVkIHByb2Nlc3MnLCBAcHJvdmlkZXJcbiAgICAgIGVsc2UgaWYgcmVzcGF3bmVkXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAgIFtcIkZhaWxlZCB0byBzcGF3biBkYWVtb24gZm9yIGF1dG9jb21wbGV0ZS1weXRob24uXCJcbiAgICAgICAgICAgXCJDb21wbGV0aW9ucyB3aWxsIG5vdCB3b3JrIGFueW1vcmVcIlxuICAgICAgICAgICBcInVubGVzcyB5b3UgcmVzdGFydCB5b3VyIGVkaXRvci5cIl0uam9pbignICcpLCB7XG4gICAgICAgICAgZGV0YWlsOiBbXCJleGl0Q29kZTogI3twcm9jZXNzLmV4aXRDb2RlfVwiXG4gICAgICAgICAgICAgICAgICAgXCJzaWduYWxDb2RlOiAje3Byb2Nlc3Muc2lnbmFsQ29kZX1cIl0uam9pbignXFxuJyksXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgICBAZGlzcG9zZSgpXG4gICAgICBlbHNlXG4gICAgICAgIEBfc3Bhd25EYWVtb24oKVxuICAgICAgICBAX3NlbmRSZXF1ZXN0KGRhdGEsIHJlc3Bhd25lZDogdHJ1ZSlcbiAgICAgICAgbG9nLmRlYnVnICdSZS1zcGF3bmluZyBweXRob24gcHJvY2Vzcy4uLidcbiAgICBlbHNlXG4gICAgICBsb2cuZGVidWcgJ1NwYXduaW5nIHB5dGhvbiBwcm9jZXNzLi4uJ1xuICAgICAgQF9zcGF3bkRhZW1vbigpXG4gICAgICBAX3NlbmRSZXF1ZXN0KGRhdGEpXG5cbiAgX2Rlc2VyaWFsaXplOiAocmVzcG9uc2UpIC0+XG4gICAgbG9nLmRlYnVnICdEZXNlcmVhbGl6aW5nIHJlc3BvbnNlIGZyb20gSmVkaScsIHJlc3BvbnNlXG4gICAgbG9nLmRlYnVnIFwiR290ICN7cmVzcG9uc2UudHJpbSgpLnNwbGl0KCdcXG4nKS5sZW5ndGh9IGxpbmVzXCJcbiAgICBmb3IgcmVzcG9uc2VTb3VyY2UgaW4gcmVzcG9uc2UudHJpbSgpLnNwbGl0KCdcXG4nKVxuICAgICAgdHJ5XG4gICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXNwb25zZVNvdXJjZSlcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiXCJcIkZhaWxlZCB0byBwYXJzZSBKU09OIGZyb20gXFxcIiN7cmVzcG9uc2VTb3VyY2V9XFxcIi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIE9yaWdpbmFsIGV4Y2VwdGlvbjogI3tlfVwiXCJcIilcblxuICAgICAgaWYgcmVzcG9uc2VbJ2FyZ3VtZW50cyddXG4gICAgICAgIGVkaXRvciA9IEByZXF1ZXN0c1tyZXNwb25zZVsnaWQnXV1cbiAgICAgICAgaWYgdHlwZW9mIGVkaXRvciA9PSAnb2JqZWN0J1xuICAgICAgICAgIGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgICAjIENvbXBhcmUgcmVzcG9uc2UgSUQgd2l0aCBjdXJyZW50IHN0YXRlIHRvIGF2b2lkIHN0YWxlIGNvbXBsZXRpb25zXG4gICAgICAgICAgaWYgcmVzcG9uc2VbJ2lkJ10gPT0gQF9nZW5lcmF0ZVJlcXVlc3RJZCgnYXJndW1lbnRzJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgICAgICAgIEBzbmlwcGV0c01hbmFnZXI/Lmluc2VydFNuaXBwZXQocmVzcG9uc2VbJ2FyZ3VtZW50cyddLCBlZGl0b3IpXG4gICAgICBlbHNlXG4gICAgICAgIHJlc29sdmUgPSBAcmVxdWVzdHNbcmVzcG9uc2VbJ2lkJ11dXG4gICAgICAgIGlmIHR5cGVvZiByZXNvbHZlID09ICdmdW5jdGlvbidcbiAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlWydyZXN1bHRzJ10pXG4gICAgICBjYWNoZVNpemVEZWx0YSA9IE9iamVjdC5rZXlzKEByZXNwb25zZXMpLmxlbmd0aCA+IEBjYWNoZVNpemVcbiAgICAgIGlmIGNhY2hlU2l6ZURlbHRhID4gMFxuICAgICAgICBpZHMgPSBPYmplY3Qua2V5cyhAcmVzcG9uc2VzKS5zb3J0IChhLCBiKSA9PlxuICAgICAgICAgIHJldHVybiBAcmVzcG9uc2VzW2FdWyd0aW1lc3RhbXAnXSAtIEByZXNwb25zZXNbYl1bJ3RpbWVzdGFtcCddXG4gICAgICAgIGZvciBpZCBpbiBpZHMuc2xpY2UoMCwgY2FjaGVTaXplRGVsdGEpXG4gICAgICAgICAgbG9nLmRlYnVnICdSZW1vdmluZyBvbGQgaXRlbSBmcm9tIGNhY2hlIHdpdGggSUQnLCBpZFxuICAgICAgICAgIGRlbGV0ZSBAcmVzcG9uc2VzW2lkXVxuICAgICAgQHJlc3BvbnNlc1tyZXNwb25zZVsnaWQnXV0gPVxuICAgICAgICBzb3VyY2U6IHJlc3BvbnNlU291cmNlXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgbG9nLmRlYnVnICdDYWNoZWQgcmVxdWVzdCB3aXRoIElEJywgcmVzcG9uc2VbJ2lkJ11cbiAgICAgIGRlbGV0ZSBAcmVxdWVzdHNbcmVzcG9uc2VbJ2lkJ11dXG5cbiAgX2dlbmVyYXRlUmVxdWVzdElkOiAodHlwZSwgZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgdGV4dCkgLT5cbiAgICBpZiBub3QgdGV4dFxuICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICByZXR1cm4gcmVxdWlyZSgnY3J5cHRvJykuY3JlYXRlSGFzaCgnbWQ1JykudXBkYXRlKFtcbiAgICAgIGVkaXRvci5nZXRQYXRoKCksIHRleHQsIGJ1ZmZlclBvc2l0aW9uLnJvdyxcbiAgICAgIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiwgdHlwZV0uam9pbigpKS5kaWdlc3QoJ2hleCcpXG5cbiAgX2dlbmVyYXRlUmVxdWVzdENvbmZpZzogLT5cbiAgICBleHRyYVBhdGhzID0gQEludGVycHJldGVyTG9va3VwLmFwcGx5U3Vic3RpdHV0aW9ucyhcbiAgICAgIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5leHRyYVBhdGhzJykuc3BsaXQoJzsnKSlcbiAgICBhcmdzID1cbiAgICAgICdleHRyYVBhdGhzJzogZXh0cmFQYXRoc1xuICAgICAgJ3VzZVNuaXBwZXRzJzogYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnVzZVNuaXBwZXRzJylcbiAgICAgICdjYXNlSW5zZW5zaXRpdmVDb21wbGV0aW9uJzogYXRvbS5jb25maWcuZ2V0KFxuICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbi5jYXNlSW5zZW5zaXRpdmVDb21wbGV0aW9uJylcbiAgICAgICdzaG93RGVzY3JpcHRpb25zJzogYXRvbS5jb25maWcuZ2V0KFxuICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbi5zaG93RGVzY3JpcHRpb25zJylcbiAgICAgICdmdXp6eU1hdGNoZXInOiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZnV6enlNYXRjaGVyJylcbiAgICByZXR1cm4gYXJnc1xuXG4gIHNldFNuaXBwZXRzTWFuYWdlcjogKEBzbmlwcGV0c01hbmFnZXIpIC0+XG5cbiAgX2NvbXBsZXRlQXJndW1lbnRzOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgZm9yY2UpIC0+XG4gICAgdXNlU25pcHBldHMgPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24udXNlU25pcHBldHMnKVxuICAgIGlmIG5vdCBmb3JjZSBhbmQgdXNlU25pcHBldHMgPT0gJ25vbmUnXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2F0b20tdGV4dC1lZGl0b3InKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2F1dG9jb21wbGV0ZS1wbHVzOmFjdGl2YXRlJylcbiAgICAgIHJldHVyblxuICAgIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcbiAgICBzY29wZUNoYWluID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3BlQ2hhaW4oKVxuICAgIGRpc2FibGVGb3JTZWxlY3RvciA9IEBTZWxlY3Rvci5jcmVhdGUoQGRpc2FibGVGb3JTZWxlY3RvcilcbiAgICBpZiBAc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKGRpc2FibGVGb3JTZWxlY3Rvciwgc2NvcGVDaGFpbilcbiAgICAgIGxvZy5kZWJ1ZyAnSWdub3JpbmcgYXJndW1lbnQgY29tcGxldGlvbiBpbnNpZGUgb2YnLCBzY29wZUNoYWluXG4gICAgICByZXR1cm5cblxuICAgICMgd2UgZG9uJ3Qgd2FudCB0byBjb21wbGV0ZSBhcmd1bWVudHMgaW5zaWRlIG9mIGV4aXN0aW5nIGNvZGVcbiAgICBsaW5lcyA9IGVkaXRvci5nZXRCdWZmZXIoKS5nZXRMaW5lcygpXG4gICAgbGluZSA9IGxpbmVzW2J1ZmZlclBvc2l0aW9uLnJvd11cbiAgICBwcmVmaXggPSBsaW5lLnNsaWNlKGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiAtIDEsIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbilcbiAgICBpZiBwcmVmaXggaXNudCAnKCdcbiAgICAgIGxvZy5kZWJ1ZyAnSWdub3JpbmcgYXJndW1lbnQgY29tcGxldGlvbiB3aXRoIHByZWZpeCcsIHByZWZpeFxuICAgICAgcmV0dXJuXG4gICAgc3VmZml4ID0gbGluZS5zbGljZSBidWZmZXJQb3NpdGlvbi5jb2x1bW4sIGxpbmUubGVuZ3RoXG4gICAgaWYgbm90IC9eKFxcKSg/OiR8XFxzKXxcXHN8JCkvLnRlc3Qoc3VmZml4KVxuICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBhcmd1bWVudCBjb21wbGV0aW9uIHdpdGggc3VmZml4Jywgc3VmZml4XG4gICAgICByZXR1cm5cblxuICAgIHBheWxvYWQgPVxuICAgICAgaWQ6IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoJ2FyZ3VtZW50cycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICBsb29rdXA6ICdhcmd1bWVudHMnXG4gICAgICBwYXRoOiBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KClcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgY29sdW1uOiBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuXG4gICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICByZXR1cm4gbmV3IFByb21pc2UgPT5cbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IGVkaXRvclxuXG4gIF9mdXp6eUZpbHRlcjogKGNhbmRpZGF0ZXMsIHF1ZXJ5KSAtPlxuICAgIGlmIGNhbmRpZGF0ZXMubGVuZ3RoIGlzbnQgMCBhbmQgcXVlcnkgbm90IGluIFsnICcsICcuJywgJygnXVxuICAgICAgY2FuZGlkYXRlcyA9IEBmaWx0ZXIoY2FuZGlkYXRlcywgcXVlcnksIGtleTogJ3RleHQnKVxuICAgIHJldHVybiBjYW5kaWRhdGVzXG5cbiAgZ2V0U3VnZ2VzdGlvbnM6ICh7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgc2NvcGVEZXNjcmlwdG9yLCBwcmVmaXh9KSAtPlxuICAgIEBsb2FkKClcbiAgICBpZiBub3QgQHRyaWdnZXJDb21wbGV0aW9uUmVnZXgudGVzdChwcmVmaXgpXG4gICAgICByZXR1cm4gQGxhc3RTdWdnZXN0aW9ucyA9IFtdXG4gICAgYnVmZmVyUG9zaXRpb24gPVxuICAgICAgcm93OiBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgbGluZXMgPSBlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0TGluZXMoKVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxuICAgICAgIyB3ZSB3YW50IHRvIGRvIG91ciBvd24gZmlsdGVyaW5nLCBoaWRlIGFueSBleGlzdGluZyBzdWZmaXggZnJvbSBKZWRpXG4gICAgICBsaW5lID0gbGluZXNbYnVmZmVyUG9zaXRpb24ucm93XVxuICAgICAgbGFzdElkZW50aWZpZXIgPSAvXFwuP1thLXpBLVpfXVthLXpBLVowLTlfXSokLy5leGVjKFxuICAgICAgICBsaW5lLnNsaWNlIDAsIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbilcbiAgICAgIGlmIGxhc3RJZGVudGlmaWVyXG4gICAgICAgIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiA9IGxhc3RJZGVudGlmaWVyLmluZGV4ICsgMVxuICAgICAgICBsaW5lc1tidWZmZXJQb3NpdGlvbi5yb3ddID0gbGluZS5zbGljZSgwLCBidWZmZXJQb3NpdGlvbi5jb2x1bW4pXG4gICAgcmVxdWVzdElkID0gQF9nZW5lcmF0ZVJlcXVlc3RJZChcbiAgICAgICdjb21wbGV0aW9ucycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24sIGxpbmVzLmpvaW4oJ1xcbicpKVxuICAgIGlmIHJlcXVlc3RJZCBvZiBAcmVzcG9uc2VzXG4gICAgICBsb2cuZGVidWcgJ1VzaW5nIGNhY2hlZCByZXNwb25zZSB3aXRoIElEJywgcmVxdWVzdElkXG4gICAgICAjIFdlIGhhdmUgdG8gcGFyc2UgSlNPTiBvbiBlYWNoIHJlcXVlc3QgaGVyZSB0byBwYXNzIG9ubHkgYSBjb3B5XG4gICAgICBtYXRjaGVzID0gSlNPTi5wYXJzZShAcmVzcG9uc2VzW3JlcXVlc3RJZF1bJ3NvdXJjZSddKVsncmVzdWx0cyddXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZnV6enlNYXRjaGVyJylcbiAgICAgICAgcmV0dXJuIEBsYXN0U3VnZ2VzdGlvbnMgPSBAX2Z1enp5RmlsdGVyKG1hdGNoZXMsIHByZWZpeClcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIEBsYXN0U3VnZ2VzdGlvbnMgPSBtYXRjaGVzXG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogcmVxdWVzdElkXG4gICAgICBwcmVmaXg6IHByZWZpeFxuICAgICAgbG9va3VwOiAnY29tcGxldGlvbnMnXG4gICAgICBwYXRoOiBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KClcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgY29sdW1uOiBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuXG4gICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZnV6enlNYXRjaGVyJylcbiAgICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gKG1hdGNoZXMpID0+XG4gICAgICAgICAgcmVzb2x2ZShAbGFzdFN1Z2dlc3Rpb25zID0gQF9mdXp6eUZpbHRlcihtYXRjaGVzLCBwcmVmaXgpKVxuICAgICAgZWxzZVxuICAgICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSAoc3VnZ2VzdGlvbnMpID0+XG4gICAgICAgICAgcmVzb2x2ZShAbGFzdFN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnMpXG5cbiAgZ2V0RGVmaW5pdGlvbnM6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIHBheWxvYWQgPVxuICAgICAgaWQ6IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoJ2RlZmluaXRpb25zJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIGxvb2t1cDogJ2RlZmluaXRpb25zJ1xuICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgc291cmNlOiBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBsaW5lOiBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcblxuICAgIEBfc2VuZFJlcXVlc3QoQF9zZXJpYWxpemUocGF5bG9hZCkpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gcmVzb2x2ZVxuXG4gIGdldFVzYWdlczogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogQF9nZW5lcmF0ZVJlcXVlc3RJZCgndXNhZ2VzJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIGxvb2t1cDogJ3VzYWdlcydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IHJlc29sdmVcblxuICBnZXRNZXRob2RzOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICBpbmRlbnQgPSBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICBsaW5lcyA9IGVkaXRvci5nZXRCdWZmZXIoKS5nZXRMaW5lcygpXG4gICAgbGluZXMuc3BsaWNlKGJ1ZmZlclBvc2l0aW9uLnJvdyArIDEsIDAsIFwiICBkZWYgX19hdXRvY29tcGxldGVfcHl0aG9uKHMpOlwiKVxuICAgIGxpbmVzLnNwbGljZShidWZmZXJQb3NpdGlvbi5yb3cgKyAyLCAwLCBcIiAgICBzLlwiKVxuICAgIHBheWxvYWQgPVxuICAgICAgaWQ6IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoJ21ldGhvZHMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgbG9va3VwOiAnbWV0aG9kcydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogbGluZXMuam9pbignXFxuJylcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvdyArIDJcbiAgICAgIGNvbHVtbjogNlxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IChtZXRob2RzKSAtPlxuICAgICAgICByZXNvbHZlKHttZXRob2RzLCBpbmRlbnQsIGJ1ZmZlclBvc2l0aW9ufSlcblxuICBnb1RvRGVmaW5pdGlvbjogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgaWYgbm90IGVkaXRvclxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgbm90IGJ1ZmZlclBvc2l0aW9uXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgQGRlZmluaXRpb25zVmlld1xuICAgICAgQGRlZmluaXRpb25zVmlldy5kZXN0cm95KClcbiAgICBAZGVmaW5pdGlvbnNWaWV3ID0gbmV3IEBEZWZpbml0aW9uc1ZpZXcoKVxuICAgIEBnZXREZWZpbml0aW9ucyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKS50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgQGRlZmluaXRpb25zVmlldy5zZXRJdGVtcyhyZXN1bHRzKVxuICAgICAgaWYgcmVzdWx0cy5sZW5ndGggPT0gMVxuICAgICAgICBAZGVmaW5pdGlvbnNWaWV3LmNvbmZpcm1lZChyZXN1bHRzWzBdKVxuXG4gIGRpc3Bvc2U6IC0+XG4gICAgaWYgQGRpc3Bvc2FibGVzXG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgaWYgQHByb3ZpZGVyXG4gICAgICBAcHJvdmlkZXIua2lsbCgpXG4iXX0=
