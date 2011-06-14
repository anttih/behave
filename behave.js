
var Runner = exports.Runner = function() {
    this.events = {
        ok: [],
        failure: [],
        error: []
    };
};

Runner.prototype = {
    run: function (suite) {
        var name, test;
        for (name in suite) {
            test = suite[name];
            
            if (typeof test === 'object') {
                this.run(test);
            } else if (typeof test === 'function') {
                this._run_test(name, test);
            }
        }
    },

    _run_test: function (name, test) {
        try {
            test();
            this.fire('ok', '[TOP-LEVEL]', name);
        } catch (e) {
            if (e.name === 'AssertionError') {
                this.fire('failure', '[TOP-LEVEL]', name, e);
            } else {
                this.fire('error', '[TOP-LEVEL]', name, e);
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
