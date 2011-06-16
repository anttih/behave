var Runner = require('behave').Runner;
var vows = require('vows');
var assert = require('assert');

var run_suite = function (suite, name) {
    var runner = new Runner();

    var results = {
        ok: [],
        errors: [],
        failures: []
    };

    runner.on('ok', function (context, name) {
        results.ok.push({
            context: context,
            name:    name
        });
    });

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

    runner.run(suite, name);
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

    'Suite with one passing test': {
        topic: function () {
            return run_suite({'context': {'test name' : function () {}}});
        },
        'has one passing test': function (results) {
            assert.equal(results.ok.length, 1);
        }
    },
    'Suite with a failure': {
        topic: function (runner) {
            return run_suite({context: {'test name' : function () {
                assert.ok(false);
            }}});
        },
        'has one failure': function (results) {
            assert.equal(results.failures.length, 1);
        },
        'failure is fired with context': function (results) {
            assert.deepEqual(results.failures[0].context, ['context']);
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
            return run_suite({context: {'test name': function () {
                throw new Error();
            }}});
        },
        'has one error': function (results) {
            assert.equal(results.errors.length, 1);
        },
        'error is fired with context': function (results) {
            assert.deepEqual(results.errors[0].context, ['context']);
        },
        'error is fired with test name': function (results) {
            assert.equal(results.errors[0].name, 'test name');
        },
        'error is fired with exception': function (results) {
            assert.equal(results.errors[0].exception.name, 'Error');
        }
    },

    'Suite with a context': {
        topic: function () {
            return run_suite({
                'Context name': {
                    'test name': function () {}
                }
            });
        },

        'runs test in context': function (results) {
            assert.equal(results.ok.length, 1);
        },
        'report ok with context and name': function (results) {
            var info = results.ok[0];
            assert.deepEqual(info.context, ['Context name']);
            assert.equal(info.name, 'test name');
        }
    },
    'Suite with a nested failure': {
        topic: function () {
            return run_suite({
                'Failure context': {
                    'failing test': function () {
                        assert.ok(false);
                    }
                }
            });
        },

        'report failure with context and name': function (results) {
            var info = results.failures[0];
            assert.deepEqual(info.context, ['Failure context']);
            assert.equal(info.name, 'failing test');
        }
    },
    'Suite with two contexts at the same level': {
        topic: function () {
            return run_suite({
                'First context': { 'first test': function () {} },
                'Second context': { 'second test': function () {} }
            });
        },
        'reports ok with correct context names': function (results) {
            assert.deepEqual(results.ok[0].context, ['First context']);
            assert.deepEqual(results.ok[1].context, ['Second context']);
        }
    },
    'Suite with before_each hook and one test': {
        topic: function () {
            var before_each_value = 0;
            var before_each_value_inside_test;
            this.results = run_suite({
                'Context name': {
                    before_each: function () {
                        before_each_value += 1;
                    },
                    'test name': function () {
                        before_each_value_inside_test = before_each_value;
                    }
                }
            });
            return before_each_value_inside_test;
        },
        'does not run hook as a test': function () {
            assert.equal(this.results.ok.length, 1);
            assert.equal(this.results.ok[0].name, 'test name');
        },
        'runs hook only once before the test': function (value) {
            assert.equal(value, 1);
        }
    },
    'Suite with before_each hook in two contexts at the same level': {
        topic: function () {
            var before_each_value = 0;
            var before_each_value_inside_test;
            this.results = run_suite({
                'Context name': {
                    before_each: function () { before_each_value += 1; },
                    'test name': function () {}
                },
                'Second context': {
                    'second test': function () {
                        before_each_value_inside_test = before_each_value;
                    }
                }
            });
            return before_each_value_inside_test;
        },
        'runs hook only for the test in its level': function (value) {
            assert.equal(value, 1);
        }
    },
    'Suite with before_each hook accessing "this"': {
        topic: function () {
            var hello;
            run_suite({
                'Context name': {
                    before_each: function () { this.hello = 'world'; },
                    'test name': function () { hello = this.hello || 'FAIL'; }
                },
            });
            return hello;
        },
        'runs before each hook in the same "this" context': function (hello) {
            assert.equal(hello, 'world');
        }
    },
    'Nested tests': {
        topic: function () {
            var value = true;
            run_suite({
                'first': function () { this.value = true; },
                'nested': {
                    'second': function () {
                        // vows needs some other return value than undefined
                        value = this.value || 'undefined';
                    }
                }
            });
            return value;
        },
        "each run in a clean 'this' environment": function (value) {
            assert.equal(value, 'undefined');
        }
    },
    'Suite with nested before_each hooks' : {
        topic: function () {
            var hook;
            run_suite({
                'context': {
                    before_each: function () { this.hook = 'first'; },
                    'nested context' : {
                        before_each: function () { this.hook = this.hook + ' second'; },
                        'test name': function () { hook = this.hook; }
                    }
                },
            });
            return hook;
        },
        'runs each before_each hook once in correct order': function (hook) {
            assert.equal(hook, 'first second');
        }
    }
}).export(module);
