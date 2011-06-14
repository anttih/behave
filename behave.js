
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
        this._run_context([this.top_level_context], suite);
    },

    _run_context: function (context, suite) {
        var before_each, context_copy, name, test;
        if ('before_each' in suite) {
            before_each = suite.before_each;
        }
        for (name in suite) {
            test = suite[name];
            
            if (typeof test === 'object') {
                context_copy = context.slice(0);
                context_copy.push(name);
                this._run_context(context_copy, test);
            } else if (typeof test === 'function' && name !== 'before_each') {
                this._run_test(context, name, test, before_each);
            }
        }
    },

    _run_test: function (context, name, test, before_each) {
        var that = {};
        try {
            if (before_each) {
                before_each();
            }
            test.apply(that);
            this.fire('ok', context, name);
        } catch (e) {
            if (e.name === 'AssertionError') {
                this.fire('failure', context, name, e);
            } else {
                this.fire('error', context, name, e);
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
