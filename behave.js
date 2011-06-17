
var Runner = exports.Runner = function() {
    this.events = {
        ok: [],
        failure: [],
        error: []
    };
    this.top_level_context = '[TOP-LEVEL]';
};

Runner.prototype = {
    run: function (suite) {
        var context = new TestContext();
        this._run_context(context, suite);
    },

    _run_context: function (context, suite) {
        var name, test;

        if ('before_each' in suite) {
            context.push_before_each(suite.before_each);
        }

        for (name in suite) {
            test = suite[name];
            
            if (typeof test === 'object') {
                this._run_context(context.push(name), test);
            } else if (this._is_test(test, name)) {
                this._run_test(context, name, test);
            }
        }
    },

    _is_test: function (f, name) {
        return typeof f === 'function' && name !== 'before_each';
    },

    _run_test: function (context, name, test) {
        try {
            context.run_test(test);
            this.fire('ok', context.stack, name);
        } catch (e) {
            if (e.name === 'AssertionError') {
                this.fire('failure', context.stack, name, e);
            } else {
                this.fire('error', context.stack, name, e);
            }
        }
    },

    fire: function (event, context, name, exception) {
        var callbacks, event, i;
        callbacks = this.events[event];
        for (i = 0; i < callbacks.length; i++) {
            event = callbacks[i];
            event(context, name, exception);
        }
    },

    on: function(event, callback) {
        this.events[event].push(callback);
    }
};

var TestContext = function (stack, before_each) {
    // context name stack
    this.stack = stack || [];
    this.before_each = before_each || [];
};

TestContext.prototype = {
    push: function (name) {
        var copy = this.stack.slice(0);
        copy.push(name);
        return new TestContext(copy, this.before_each.slice(0));
    },

    push_before_each: function (hook) {
        this.before_each.push(hook);
    },

    run_test: function (test) {
        var i, that = {};
        for (i = 0; i < this.before_each.length; i++) {
            this.before_each[i].apply(that);
        }
        test.apply(that);
    }
};

var SugarCollector = exports.SugarCollector = function () {
    this.callback = null;
};

SugarCollector.prototype = {
    suite: function (f) {
        this.callback = f;
    },
    start: function (obj) {
        var suite = {},
            that = this
            stack = [];

        var get_current_context = function () {
            var i, obj = suite;
            for (i = 0; i < stack.length; i++) {
                obj = obj[stack[i]];
            }
            return obj;
        };

        var describe = function (name, block) {
            var context = get_current_context();

            stack.push(name);

            // create a new context in the suite
            context[name] = {};

            // collect child-contexts
            block();

            stack.pop();

            if (stack.length === 0) {
                that.callback(suite);
                suite = {};
            }
        };

        var it = function (name, f) {
            get_current_context()[name] = f;
        };

        var before_each = function (f) {
            get_current_context().before_each = f;
        };

        obj.describe = describe;
        obj.it = it;
        obj.before_each = before_each;
    },
    stop: function () {
    }
};

var SpecReporter = exports.SpecReporter = function (stream) {
    this.stream = stream;
    this.written_context_names = [];
    this.ok_count = 0;
    this.failure_count = 0;
    this.error_count = 0;
};

SpecReporter.prototype = {
    ok: function (context, name) {
        this.ok_count++;
        this._write_context(context);
        this._write_test_name(context.length, name);
    },
    failure: function (context, name, e) {
        var level = context.length;
        this.failure_count++;

        this._write_context(context);
        this._write_test_name(level, name);
        this._write_indented_line(level, '  Failure: ' + e.message);
        this._write_indented_line(level, '    expected: ' + JSON.stringify(e.expected));
        this._write_indented_line(level, '    got:      ' + JSON.stringify(e.actual));
    },
    error: function (context, name, e) {
        var level = context.length;
        this.error_count++;

        this._write_context(context);
        this._write_test_name(level, name);
        this._write_indented_line(level, '  Error: ' + e.message);
    },
    summary: function () {
        var total = this.ok_count + this.failure_count + this.error_count;
        this.stream.write('\n' + total + ' examples, '
                          + this.failure_count + ' failures, '
                          + this.error_count + ' errors\n');
    },

    _write_test_name: function (level, name) {
        this._write_indented_line(level, name);
    },

    _write_context: function (context) {
        var i, new_contexts = [];
        for (i = 0; i < context.length; i++) {
            if (this.written_context_names[i] !== context[i]) {
                new_contexts = context.slice(i);
                break;
            }
        }

        this._write_context_names(i, new_contexts);
        this.written_context_names = context;
    },

    _write_indented_line: function (level, str) {
        this.stream.write(this._indent(level) + str + '\n');
    },
    _write_context_names: function (level, names) {
        var that = this;
        if (level === 0) {
            this.stream.write('\n');
        }
        names.forEach(function (name) {
            that._write_indented_line(level, name);
            level++;
        });
    },
    _indent: function (level) {
        var space = '';
        while (level--) {
            space += '  ';
        }
        return space;
    }
};
