var assert = require('assert');
var Runner = require('behave').Runner;

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

describe("Running a suite", function () {
    var results;

    describe("Empty suite", function () {
        before_each(function () {
            this.results = run_suite({});
        });

        it("has no errors", function () {
            assert.equal(this.results.errors.length, 0);
        });

        it("has no failures", function () {
            assert.equal(this.results.failures.length, 0);
        });
    });

    describe('Suite with one passing test', function () {
        before_each(function () {
            this.results = run_suite({'context': {'test name' : function () {}}});
        });

        it('has one passing test', function () {
            assert.equal(this.results.ok.length, 1);
        });
    });

    describe('Suite with a failure', function () {
        before_each(function () {
            results = run_suite({context: {'test name' : function () {
                assert.ok(false);
            }}});
        });

        it('has one failure', function () {
            assert.equal(results.failures.length, 1);
        });

        it('failure is fired with context', function () {
            assert.deepEqual(results.failures[0].context, ['context']);
        });

        it('failure is fired with test name', function () {
            assert.equal(results.failures[0].name, 'test name');
        });

        it('failure is fired with exception', function () {
            assert.equal(results.failures[0].exception.name, 'AssertionError');
        });
    });

    describe('Suite with an error', function () {
        before_each(function () {
            results = run_suite({context: {'test name': function () {
                throw new Error();
            }}});
        });

        it('has one error', function () {
            assert.equal(results.errors.length, 1);
        });

        it('error is fired with context', function () {
            assert.deepEqual(results.errors[0].context, ['context']);
        });

        it('error is fired with test name', function () {
            assert.equal(results.errors[0].name, 'test name');
        });

        it('error is fired with exception', function () {
            assert.equal(results.errors[0].exception.name, 'Error');
        });
    });

    describe('Suite with a context', function () {
        before_each(function () {
            results = run_suite({
                'Context name': {
                    'test name': function () {}
                }
            });
        });

        it('runs test in context', function () {
            assert.equal(results.ok.length, 1);
        });

        it('report ok with context and name', function () {
            var info = results.ok[0];
            assert.deepEqual(info.context, ['Context name']);
            assert.equal(info.name, 'test name');
        });
    });
    describe('Suite with a nested failure', function () {
        before_each(function () {
            results = run_suite({
                'Failure context': {
                    'failing test': function () {
                        assert.ok(false);
                    }
                }
            });
        });

        it('report failure with context and name', function () {
            var info = results.failures[0];
            assert.deepEqual(info.context, ['Failure context']);
            assert.equal(info.name, 'failing test');
        });
    });
    describe('Suite with two contexts at the same level', function () {
        before_each(function () {
            results = run_suite({
                'First context': { 'first test': function () {} },
                'Second context': { 'second test': function () {} }
            });
        });

        it('reports ok with correct context names', function () {
            assert.deepEqual(results.ok[0].context, ['First context']);
            assert.deepEqual(results.ok[1].context, ['Second context']);
        });
    });
    describe('Suite with before_each hook and one test', function () {
        before_each(function () {
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
            this.before_each_value_inside_test = before_each_value_inside_test;
        });

        it('does not run hook as a test', function () {
            assert.equal(this.results.ok.length, 1);
            assert.equal(this.results.ok[0].name, 'test name');
        });

        it('runs hook only once before the test', function () {
            assert.equal(this.before_each_value_inside_test , 1);
        });
    });

    describe('Suite with before_each hook in two contexts at the same level', function () {
        before_each(function () {
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
            this.before_each_value_inside_test = before_each_value_inside_test;
        });

        it('runs hook only for the test in its level', function () {
            assert.equal(this.before_each_value_inside_test, 1);
        });
    });
    describe('Suite with before_each hook accessing "this"', function () {
        before_each(function () {
            var hello;
            run_suite({
                'Context name': {
                    before_each: function () { this.hello = 'world'; },
                    'test name': function () { hello = this.hello || 'FAIL'; }
                },
            });
            this.hello = hello;
        });

        it('runs before each hook in the same "this" context', function () {
            assert.equal(this.hello, 'world');
        });
    });
    describe('Nested tests', function () {
        before_each(function () {
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
            this.value = value;
        });

        it("each run in a clean 'this' environment", function () {
            assert.equal(this.value, 'undefined');
        });
    });
    describe('Suite with nested before_each hooks' , function () {
        before_each(function () {
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
            this.hook = hook;
        });

        it('runs each before_each hook once in correct order', function () {
            assert.equal(this.hook, 'first second');
        });
    });
});
