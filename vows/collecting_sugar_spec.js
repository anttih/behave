var Collector = require('behave').SugarCollector;
var vows = require('vows');
var assert = require('assert');

var collect = function (c, f) {
    var collector = new Collector();
    var suites = [];

    collector.suite(function (suite) {
        suites.push(suite);
    });

    collector.start(c);
    f();
    collector.stop();

    return suites;
};

vows.describe("Collecting tests").addBatch({
    'with one empty context': {
        topic: function () {
            var g = {};
            return collect(g, function () {
                g.describe("Empty suite", function () {});
            });
        },
        'we find one empty context with name': function (suites) {
            assert.equal(suites.length, 1);
            assert.deepEqual(suites[0], {'Empty suite':{}});
        }
    },
    'with one context with one test': {
        topic: function () {
            var g = {};
            return collect(g, function () {
                g.describe("Empty suite", function () {
                    g.it('test name', function () {});
                });
            });
        },
        'we find one context with one test': function (suites) {
            assert.equal(suites.length, 1);
            assert.ok('Empty suite' in suites[0]);
            assert.ok('test name' in suites[0]['Empty suite']);
        }
    },
    'with contexts': {
        topic: function () {
            var g = {};
            return collect(g, function () {
                g.describe('first', function () {
                    g.it('test name', function () {});
                });
                g.describe('second', function () {
                    g.it('test name', function () {});
                });
            });
        },
        'we find two suites': function (suites) {
            assert.equal(suites.length, 2);
            assert.ok('first' in suites[0]);
            assert.ok(! ('second' in suites[0]));

            assert.ok('test name' in suites[0]['first']);
            assert.ok('test name' in suites[1]['second']);
        }
    },
    'with nested contexts': {
        topic: function () {
            var g = {};
            return collect(g, function () {
                g.describe("Empty suite", function () {
                    g.describe('nested', function () {
                        g.it('test name', function () {});
                    });
                });
            });
        },
        'we find nested context with one test': function (suites) {
            assert.equal(suites.length, 1);
            assert.ok('Empty suite' in suites[0]);
            assert.ok('nested' in suites[0]['Empty suite']);
            assert.ok('test name' in suites[0]['Empty suite']['nested']);
        }
    },
    'with nested contexts at the same level': {
        topic: function () {
            var g = {};
            return collect(g, function () {
                g.describe("Empty suite", function () {
                    g.describe('nested 1', function () {
                        g.it('test name', function () {});
                    });
                    g.describe('nested 2', function () {
                        g.it('test name', function () {});
                    });
                });
            });
        },
        'we find two nested contexts with one test in both': function (suites) {
            assert.equal(suites.length, 1);
            assert.ok('Empty suite' in suites[0]);

            assert.ok('nested 1' in suites[0]['Empty suite']);
            assert.ok('test name' in suites[0]['Empty suite']['nested 1']);

            assert.ok('nested 2' in suites[0]['Empty suite']);
            assert.ok('test name' in suites[0]['Empty suite']['nested 2']);
        }
    }
}).export(module);
