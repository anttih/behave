var Reporter = require('behave').SpecReporter;
var vows = require('vows');
var assert = require('assert');
var AssertionError = require('assert').AssertionError;

function new_stream() {
    return {
        data: '',
        write: function (data) {
            this.data += data;
        }
    };
}

vows.describe("Spec reporter").addBatch({
    'Passing tests' : {
        'prints context as topic': function () {
            stream = new_stream();
            var reporter = new Reporter(stream);

            reporter.ok(['Topic'], 'test name');
            assert.equal(stream.data, '\nTopic\n- test name\n');
        },
        'prints context name only once for all the tests in that context': function () {
            stream = new_stream();
            var reporter = new Reporter(stream);

            reporter.ok(['Topic'], 'test name');
            reporter.ok(['Topic'], 'second test');
            assert.equal(stream.data, '\nTopic\n- test name\n- second test\n');
        },
        'concatenates nested context names as one': function () {
            stream = new_stream();
            var reporter = new Reporter(stream);

            reporter.ok(['Topic', 'name'], 'test name');
            assert.equal(stream.data, '\nTopic name\n- test name\n');
        }
    },
    'Failing test': {
        'prints failure name and message': function () {
            stream = new_stream();
            var reporter = new Reporter(stream);

            reporter.failure(['Topic'], 'test name', new AssertionError({
                message: 'Message',
                expected: 'some',
                actual: 'other'
            }));

            assert.equal(
                stream.data,
                '\nTopic\n- test name\n  Failure: Message\n    expected: "some"\n    got:      "other"\n'
            );
        }
    },
    'Erroring test': {
        'prints error name and message': function () {
            stream = new_stream();
            var reporter = new Reporter(stream);

            reporter.error(['Topic'], 'test name', new Error('Message'));
            assert.equal(stream.data, '\nTopic\n- test name\n  Error: Message\n');
        }
    }
}).export(module);
