var vows = require('vows');
var assert = require('assert');

var Runner = function() {
    this.events = {
        failure: [],
        error: []
    };
};
Runner.prototype = {
    run: function (suite) {
        var test;
        for (var name in suite) {
            test = suite[name];
            try {
                test();
            } catch (e) {
                if (e.name === 'AssertionError') {
                    this.fire('failure', '[TOP-LEVEL]', name, e);
                } else {
                    this.fire('error', '[TOP-LEVEL]', name, e);
                }
            }
        }
    },

    fire: function (event, context, name, exception) {
        var event, i;
        var callbacks = this.events[event];
        for (i = 0; i < callbacks.length; i++) {
            event = callbacks[i];
            event(context, name, exception);
        }
    },

    on: function(event, callback) {
        this.events[event].push(callback);
    }
};

var run_suite = function (suite) {
    var runner = new Runner();

    var results = {
        errors: [],
        failures: []
    };

    runner.on('error', function (context, name, e) {
        results.errors.push({
            context: context, 
            name:   name,
            exception: e
        });
    });

    runner.on('failure', function (context, name, e) {
        results.failures.push({
            context: context, 
            name:   name,
            exception: e
        });
    });

    runner.run(suite);
    return results;
};

vows.describe("Runner").addBatch({
    'Empty suite': {
        topic: function (runner) {
            return run_suite({});
        },

        'has no errors': function (results) {
            assert.equal(results.errors.length, 0);
        },
        'has no failures': function (results) {
            assert.equal(results.failures.length, 0);
        }
    },

    'Suite with a failure': {
        topic: function (runner) {
            return run_suite({'test name' : function () {
                assert.ok(false);
            }});
        },
        'has one failure': function (results) {
            assert.equal(results.failures.length, 1);
        },
        'failure is fired with context': function (results) {
            assert.equal(results.failures[0].context, '[TOP-LEVEL]');
        },
        'failure is fired with test name': function (results) {
            assert.equal(results.failures[0].name, 'test name');
        },
        'failure is fired with exception': function (results) {
            assert.equal(results.failures[0].exception.name, 'AssertionError');
        }
    },

    'Suite with an error': {
        topic: function () {
            return run_suite({'test name': function () {
                throw new Error();
            }});
        },
        'has one error': function (results) {
            assert.equal(results.errors.length, 1);
        },
        'error is fired with context': function (results) {
            assert.equal(results.errors[0].context, '[TOP-LEVEL]');
        },
        'error is fired with test name': function (results) {
            assert.equal(results.errors[0].name, 'test name');
        },
        'error is fired with exception': function (results) {
            assert.equal(results.errors[0].exception.name, 'Error');
        }
    }

}).export(module);
