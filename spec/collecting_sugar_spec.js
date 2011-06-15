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
    }
}).export(module);
