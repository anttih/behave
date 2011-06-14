var Runner = require('behave').Runner;
var vows = require('vows');
var assert = require('assert');

var run_suite = function (suite) {
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

    'Suite with one passing test': {
        topic: function () {
            return run_suite({'test name' : function () {}});
        },
        'has one passing test': function (results) {
            assert.equal(results.ok.length, 1);
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
            assert.deepEqual(results.failures[0].context, ['[TOP-LEVEL]']);
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
            assert.deepEqual(results.errors[0].context, ['[TOP-LEVEL]']);
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
            assert.deepEqual(info.context, ['[TOP-LEVEL]', 'Context name']);
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
            assert.deepEqual(info.context, ['[TOP-LEVEL]', 'Failure context']);
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
            assert.deepEqual(results.ok[0].context, ['[TOP-LEVEL]', 'First context']);
            assert.deepEqual(results.ok[1].context, ['[TOP-LEVEL]', 'Second context']);
        }
    }
}).export(module);
