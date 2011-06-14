
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
