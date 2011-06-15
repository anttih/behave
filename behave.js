
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
        var context = new TestContext([this.top_level_context]);
        this._run_context(context, suite);
    },

    _run_context: function (context, suite) {
        var name, test;

        if ('before_each' in suite) {
            context.before_each = suite.before_each;
        }

        for (name in suite) {
            test = suite[name];
            
            if (typeof test === 'object') {
                this._run_context(context.push(name), test);
            } else if (typeof test === 'function' && name !== 'before_each') {
                this._run_test(context, name, test);
            }
        }
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

var TestContext = function (stack) {
    // context name stack
    this.stack = stack;
    this.before_each = null;
};

TestContext.prototype = {
    push: function (name) {
        var copy = this.stack.slice(0);
        copy.push(name);
        return new TestContext(copy);
    },

    run_test: function (test) {
        var that = {};
        if (this.before_each) {
            this.before_each();
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
        var suite = {}; 
        var current_context = suite;
        var that = this;
        var describe = function (context, block) {
            var old_context = current_context;
            var new_context = {};
            current_context[context] = new_context;
            current_context = new_context;

            block();
            that.callback(suite);
        };

        var it = function (name, f) {
            current_context[name] = f;
        };

        obj.describe = describe;
        obj.it = it;
    },
    stop: function () {
    }
};

var SpecReporter = exports.SpecReporter = function (stream) {
    this.stream = stream;
    this.written_context_names = [];
};

SpecReporter.prototype = {
    ok: function (context, name) {
        this._write_context(context);
        this.stream.write('- ' + name + '\n');
    },
    failure: function (context, name, e) {
        this._write_context(context);
        this.stream.write('FAIL: ' + e.message + ' in ' + name + '\n');
    },
    error: function (context, name, e) {
        this._write_context(context);
        this.stream.write('ERROR: ' + e.message + ' in ' + name + '\n');
    },
    _write_context: function (context) {
        var context = context.join(' ');
        if (! (context in this.written_context_names)) {
            this.written_context_names[context] = true;
            this.stream.write('\n' + context + '\n');
        }
    }
};
