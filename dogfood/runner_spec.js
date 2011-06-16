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
    var results;
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
