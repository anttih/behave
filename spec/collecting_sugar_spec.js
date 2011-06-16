var Collector = require('behave').SugarCollector;
var vows = require('vows');
var assert = require('assert');

describe("Collecting tests", function () {
    function collect(c, f) {
        var collector = new Collector();
        var suites = [];

        collector.suite(function (suite) {
            suites.push(suite);
        });

        collector.start(c);
        f();
        collector.stop();

        return suites;
    }

    var suites;
    describe('with one empty context', function () {
        before_each(function () {
            var g = {};
            suites = collect(g, function () {
                g.describe("Empty suite", function () {});
            });
        });

        it('we find one empty context with name', function () {
            assert.equal(suites.length, 1);
            assert.deepEqual(suites[0], {'Empty suite':{}});
        });
    });

    describe('with one context with one test', function () {
        before_each(function () {
            var g = {};
            suites = collect(g, function () {
                g.describe("Empty suite", function () {
                    g.it('test name', function () {});
                });
            });
        });

        it('we find one context with one test', function () {
            assert.equal(suites.length, 1);
            assert.ok('Empty suite' in suites[0]);
            assert.ok('test name' in suites[0]['Empty suite']);
        });
    });
    describe('with contexts', function () {
        before_each(function () {
            var g = {};
            suites = collect(g, function () {
                g.describe('first', function () {
                    g.it('test name', function () {});
                });
                g.describe('second', function () {
                    g.it('test name', function () {});
                });
            });
        });

        it('we find two suites', function () {
            assert.equal(suites.length, 2);
            assert.ok('first' in suites[0]);
            assert.ok(! ('second' in suites[0]));

            assert.ok('test name' in suites[0]['first']);
            assert.ok('test name' in suites[1]['second']);
        });
    });

    describe('with nested contexts', function () {
        before_each(function () {
            var g = {};
            suites = collect(g, function () {
                g.describe("Empty suite", function () {
                    g.describe('nested', function () {
                        g.it('test name', function () {});
                    });
                });
            });
        });

        it('we find nested context with one test', function () {
            assert.equal(suites.length, 1);
            assert.ok('Empty suite' in suites[0]);
            assert.ok('nested' in suites[0]['Empty suite']);
            assert.ok('test name' in suites[0]['Empty suite']['nested']);
        });
    });

    describe('with nested contexts at the same level', function () {
        before_each(function () {
            var g = {};
            suites = collect(g, function () {
                g.describe("Empty suite", function () {
                    g.describe('nested 1', function () {
                        g.it('test name', function () {});
                    });
                    g.describe('nested 2', function () {
                        g.it('test name', function () {});
                    });
                });
            });
        });

        it('we find two nested contexts with one test in both', function () {
            assert.equal(suites.length, 1);
            assert.ok('Empty suite' in suites[0]);

            assert.ok('nested 1' in suites[0]['Empty suite']);
            assert.ok('test name' in suites[0]['Empty suite']['nested 1']);

            assert.ok('nested 2' in suites[0]['Empty suite']);
            assert.ok('test name' in suites[0]['Empty suite']['nested 2']);
        });
    })
});
